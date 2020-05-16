import { Lox } from "./lox";
import { Token, TokenType } from "./tokentype";
import { Expr, Binary, Unary, Literal, Grouping, Assign, Variable, Logical, Call, Get, LoxSet, This, Super } from "./ast";
import { Stmt, Print, Expression, Var, Block, If, While, LoxFunction, Return, Class } from './stmt';

class Parser {
    tokens :Token[];
    current :number = 0;
    lox :Lox;

    constructor(lox: Lox, tokens :Token[]) {
        this.tokens = tokens;
        this.lox = lox;
    }

    parse() :Stmt[] {
        let statements :Stmt[] = [];

        while(!this.isAtEnd()) {
            statements.push(this.declaration());
        }

        return statements;
    }

    declaration() :Stmt {
        try {
            if (this.match(TokenType.VAR)) return this.varDeclaration();
            if (this.match(TokenType.CLASS)) return this.classDeclaration();
            if (this.match(TokenType.FUNCTION)) return this.functionDeclaration("function");
            return this.statement();
        } catch (error) {
            if(error instanceof ParseError) {
                this.synchronize();
            }
            throw error;
        }
    }

    classDeclaration() :Stmt {
        const name :Token | undefined = this.consume(TokenType.IDENTIFIER, 
                                                     `Expect class name.`);
        if(!name) throw new Error("Class declaration error.");

        let superclass :Variable | null = null;
        if(this.match(TokenType.LESS)) {
            this.consume(TokenType.IDENTIFIER, "Expect superclass name.");
            superclass = new Variable(this.previous());
        }

        this.consume(TokenType.LEFT_BRACE, "Expected '{' before class body.");
        let methods :LoxFunction[] = [];
        while(!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
            methods.push(this.functionDeclaration("method"));
        }
        this.consume(TokenType.RIGHT_BRACE, "Expected '}' after class body.");

        return new Class(name, superclass, methods);
    }

    functionDeclaration(kind :string) :LoxFunction {
        const name :Token | undefined = this.consume(TokenType.IDENTIFIER, 
                                                     `Expect ${kind} name.`);

        if(!name) throw new Error("Function declaration error.");

        this.consume(TokenType.LEFT_PAREN, "Expect '(' after " + kind + " name.");

        let parameters :Token[] = [];

        if(!this.check(TokenType.RIGHT_PAREN)) {
            do {
                if(parameters.length >= 255) {
                    this.error(this.peek(), "Cannot have more than 255 parameters.");
                }
                const param :Token | undefined = this.consume(TokenType.IDENTIFIER, 
                                                              `Expect ${kind} name.`);
                if(param) {
                    parameters.push(param);
                }
            } while(this.match(TokenType.COMMA));
        }

        this.consume(TokenType.RIGHT_PAREN, "Expect ')' after parameters.");
        this.consume(TokenType.LEFT_BRACE, "Expect '{' before body.");

        const body :Stmt[] = this.block();

        return new LoxFunction(name, parameters, body);
    }

    varDeclaration() :Stmt {
        const name :Token | undefined = this.consume(TokenType.IDENTIFIER, "Expect variable name");

        let initializer :Expr | null = null;
        if (this.match(TokenType.EQUAL)) {
            initializer = this. expression();
        }

        if(!this.lox.isRepl) this.consume(TokenType.SEMICOLON, "Expect ';' after value.");
        if(name === undefined) throw new Error("varDeclaration error.");
        return new Var(name, initializer);
    }

    statement() :Stmt {
        if(this.match(TokenType.IF)) return this.ifStatement();
        if(this.match(TokenType.PRINT)) return this.printStatement();
        if(this.match(TokenType.WHILE)) return this.whileStatement();
        if(this.match(TokenType.FOR)) return this.forStatement();
        if(this.match(TokenType.RETURN)) return this.returnStatement();
        if(this.match(TokenType.LEFT_BRACE)) return new Block(this.block());
        return this.expressionStatement();
    }

    returnStatement() :Stmt {
        const keyword :Token = this.previous();
        let value :Expr | null = null;

        if(!this.check(TokenType.SEMICOLON)) {
            value = this.expression();
        }

        this.consume(TokenType.SEMICOLON, "Expect ';' after return value.");

        return new Return(keyword, value);
    }

    ifStatement() :Stmt {
        this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'if'.");
        const condition :Expr = this.expression();
        this.consume(TokenType.RIGHT_PAREN, "Expect ')' after if condition.");

        const thenBranch = this.statement();
        let elseBranch :Stmt | null = null;
        if(this.match(TokenType.ELSE)) elseBranch = this.statement();

        return new If(condition, thenBranch, elseBranch);
        
    }

    forStatement() :Stmt {
        this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'for'.");

        let initializer :Stmt | null = null;
        if(this.match(TokenType.SEMICOLON)) {
            initializer = null;
        } else if (this.match(TokenType.VAR)) {
            initializer = this.varDeclaration();
        } else {
            initializer = this.expressionStatement();
        }

        let condition :Expr | null = null;
        if(!this.check(TokenType.SEMICOLON)) {
            condition = this.expression();
        }

        this.consume(TokenType.SEMICOLON, "Expect ';' after loop condition.");

        let increment :Expr | null = null;
        if(!this.check(TokenType.RIGHT_PAREN)) {
            increment = this.expression();
        }

        this.consume(TokenType.RIGHT_PAREN, "Expect ')' after for condition.");

        let body :Stmt = this.statement();

        if(increment !== null) {
            body = new Block([body, new Expression(increment)]);
        }

        if (condition === null) condition = new Literal(true);
        body = new While(condition, body);

        if(initializer !== null) {
            body = new Block([initializer, body]);
        }

        return body;
    }

    whileStatement() :Stmt {
        this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'while'.");
        const condition :Expr = this.expression();
        this.consume(TokenType.RIGHT_PAREN, "Expect ')' after while condition.");

        const body = this.statement();

        return new While(condition, body);
     
    }

    printStatement() :Stmt{
        const value :Expr = this.expression();
        if(!this.lox.isRepl) this.consume(TokenType.SEMICOLON, "Expect ';' after value.");
        return new Print(value);
    }

    expressionStatement() :Stmt {
        const expr :Expr = this.expression();
        if(!this.lox.isRepl) this.consume(TokenType.SEMICOLON, "Expect ';' after value.");
        return new Expression(expr);
    }

    block() :Stmt[] {
        let statements :Stmt[] = [];

        while(!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
            statements.push(this.declaration());
        }
        this.consume(TokenType.RIGHT_BRACE, "Expect '}' after block.");
        return statements;

    }

    advance() :Token {
        this.current++;
        return this.previous();
    }

    peek() :Token {
        return this.tokens[this.current];
    }

    isAtEnd() :boolean {
        return this.peek().type === TokenType.EOF;
    }

    previous() :Token {
        return this.tokens[this.current-1];
    }

    check(type :TokenType) :boolean {
        if(this.isAtEnd()) return false;
        return this.peek().type === type;
    }

    match(...tokenTypes: TokenType[]) :boolean {
        for(const type of tokenTypes) {
            if(this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false;
    }

    expression() :Expr {
        return this.assignment();
    }

    assignment() :Expr {
        const expr: Expr = this.or();

        if(this.match(TokenType.EQUAL)) {
            let equals :Token = this.previous();
            const value :Expr = this.assignment();

            if(expr instanceof Variable) {
                const name :Token = expr.name;
                return new Assign(name, value);
            } else if(expr instanceof Get) {
                return new LoxSet(expr.object, expr.name, value); 
            }

            this.error(equals, "Invalid assignment target.");
        }

        return expr;
    }

    or() :Expr {
        let expr: Expr = this.and();

        while(this.match(TokenType.OR)) {
            const operator :Token = this.previous();
            const right :Expr = this.and();
            expr = new Logical(expr, operator, right); 
        }

        return expr;

    }

    and() :Expr {
        let expr: Expr = this.equality();

        while(this.match(TokenType.AND)) {
            const operator :Token = this.previous();
            const right :Expr = this.equality();
            expr = new Logical(expr, operator, right); 
        }

        return expr;
    }

    equality() :Expr {
        let expr :Expr = this.comparison();

        while(this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
            const operator :Token = this.previous();
            const right :Expr = this.comparison();
            expr = new Binary(expr, operator, right);
        }

        return expr;
    }

    comparison() :Expr {
        let expr :Expr = this.addition();

        while(this.match(
            TokenType.GREATER, TokenType.GREATER_EQUAL,
        TokenType.LESS, TokenType.LESS_EQUAL)
             ) {
                 const operator :Token = this.previous();
                 const right :Expr = this.addition();
                 expr = new Binary(expr, operator, right);
             }
             return expr;
    }

    addition() :Expr {
        let expr :Expr = this.multiplication();

        while(this.match(TokenType.MINUS, TokenType.PLUS)) {
            const operator :Token = this.previous();

            if(this.check(operator.type)) {
                this.consume(operator.type, "");
                expr = new Binary(expr, operator, new Literal(1));
                const name = new Token(TokenType.IDENTIFIER, expr.left.name.lexeme, null, operator.line);
                expr = new Assign(name, expr);
                return expr;
            }

            const right :Expr = this.multiplication();
            expr = new Binary(expr, operator, right);
        }

        return expr;
    }

    multiplication() :Expr {
        let expr :Expr = this.unary();

        while(this.match(TokenType.SLASH, TokenType.STAR)) {
            const operator :Token = this.previous();
            const right :Expr = this.unary();
            expr = new Binary(expr, operator, right);
        }
        return expr;
    }

    unary() :Expr {
        if(this.match(TokenType.BANG, TokenType.MINUS)) {
            const operator :Token = this.previous();
            const right :Expr = this.unary();
            return new Unary(operator, right);
        }

        return this.call();
    }

    call() :Expr {
        let expr :Expr = this.primary();

        while(true) {
            if(this.match(TokenType.LEFT_PAREN)) {
                expr = this.finishCall(expr);

            } else if (this.match(TokenType.DOT)) {
                const name :Token | undefined = this.consume(TokenType.IDENTIFIER, 
                                                "Expect proper name after '.'.");
                if(!name) throw new Error("Invalid token during class property.");

                expr = new Get(expr, name);
                
            } else {
                break;
            }
        }

        return expr;
    }

    finishCall(callee :Expr) :Expr {
        let args :Expr[] = [];
        if(!this.check(TokenType.RIGHT_PAREN)) {
            do {
                if(args.length >= 255) {
                    this.error(this.peek(), "Cannot have more than 255 arguments.");
                }
                args.push(this.expression());
            } while (this.match(TokenType.COMMA));
        }

        const paren :Token | undefined = this.consume(TokenType.RIGHT_PAREN, "Expect ')' after arguments.");

        if(!paren) throw new Error("Error in function call.");

        return new Call(callee, paren, args);
   
    }

    primary() :Expr {
        if (this.match(TokenType.FALSE)) return new Literal(false);
        if (this.match(TokenType.TRUE)) return new Literal(true);
        if (this.match(TokenType.NIL)) return new Literal(null);

        if (this.match(TokenType.NUMBER, TokenType.STRING)) {
            return new Literal(this.previous().literal);
        }

        if (this.match(TokenType.LEFT_PAREN)) {
            let expr :Expr = this.expression();
            this.consume(TokenType.RIGHT_PAREN, "Expected ')' after expression.");
            return new Grouping(expr);
        }

        if(this.match(TokenType.THIS)) return new This(this.previous());
        if(this.match(TokenType.SUPER)) {
            const keyword = this.previous();

            this.consume(TokenType.DOT, "Expect '.' after 'super'.");
            const method :Token | undefined = this.consume(TokenType.IDENTIFIER, 
                                        "Expect superclass method name.");

            if(!method) throw new Error("Expect superclass method name.");

            return new Super(keyword, method);
        }
        if(this.match(TokenType.IDENTIFIER)) return new Variable(this.previous());

        throw new Error("Failed out of parse tree.");
    }

    consume(type: TokenType, message: string) {
        if(this.check(type)) return this.advance();
        this.error(this.peek(), message);
    }

    error(token: Token, message: string) {
        this.lox.tokenError(token, message);
        throw new ParseError();
    }

    synchronize() :void {
        this.advance();

        while(!this.isAtEnd()) {
            if(this.previous().type === TokenType.SEMICOLON) return;

            const type = this.peek().type;

            if (type === TokenType.CLASS) return;
            else if (type === TokenType.FUNCTION) return;
            else if (type === TokenType.VAR) return;
            else if (type === TokenType.FOR) return;
            else if (type === TokenType.IF) return;
            else if (type === TokenType.WHILE) return;
            else if (type === TokenType.PRINT) return;
            else if (type === TokenType.RETURN) return;

            this.advance();
        }
    }
}

class ParseError extends Error {
    constructor() {
        super();
    }
}

export {
    Parser
}
