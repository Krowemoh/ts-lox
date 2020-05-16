import { Lox } from './lox';
import { LoxCallable, isLoxCallable } from './loxcallable';
import { Expr, Binary, Grouping, Literal, Unary, ExprVisitor, Variable, Assign, Logical, Call, Get, LoxSet, This, Super } from './ast';
import { Token, TokenType } from './tokentype';
import { Stmt, StmtVisitor, Print, Expression, Var, Block, If, While, LoxFunction, Return, Class } from './stmt';
import { LoxNativeFunction } from './loxnativefunction';
import { Environment } from './environment';
import { LoxClass, LoxInstance } from './loxclass';

class Interpreter implements ExprVisitor, StmtVisitor {
    lox :Lox;
    globals :Environment = new Environment();
    environment :Environment  = this.globals;
    locals :any = new Map();

    constructor(lox :Lox) {
        this.lox = lox;

        this.globals.define("clock", class  implements LoxCallable {
            discrim :"LoxCallable";

            constructor() {
                this.discrim = "LoxCallable";
            }

            arity(): Number { return 0; }

            call(interpreter :Interpreter, args: any[]) :any {
                return new Date().getTime();
            }

            toString() :string {
                return "<native fn>";
            }
        });
    }

    interpret(statements: Stmt[]) {
        try {
            for(const statement of statements) {
                this.execute(statement);
            }
        } catch (error) {
            if (error instanceof RuntimeError) {
                this.lox.runtimeError(error);
            } else {
                throw error;
            }
        }
    }

    resolve(expr :Expr, depth :Number) {
        this.locals.set(expr, depth);
    }

    execute(stmt :Stmt) {
        stmt.accept(this);
    }

    evaluate(expr :Expr) :any {
        return expr.accept(this);
    }

    checkNumberOperand(operator :Token, operand :any) :void {
        if (isNaN(parseFloat(operand))) {
            throw new RuntimeError(operator, "Operand must be a number.");
        }
        return;
    }

    checkNumberOperands(operator :Token, left: any, right: any) :void {
        if (isNaN(parseFloat(left))) {
            throw new RuntimeError(operator, "Operand must be a number.");
        } else if (isNaN(parseFloat(right))) {
            throw new RuntimeError(operator, "Operand must be a number.");
        }
        return;
    }

    isEqual(left: Expr, right :Expr) :boolean {
        if(left === null && right === null) return true;
        if(left === null) return false;
        return left === right;
    }

    visitPrint(stmt :Print) :void {
        const value = this.evaluate(stmt.expression);
        console.log(value+"");
    }

    visitExpression(stmt :Expression) :void {
        const value = this.evaluate(stmt.expression);
        if (this.lox.isRepl) console.log(value+"");
    }

    visitVar(stmt :Var) :void {
        let value :any = null;
        if(stmt.initializer !== null) {
            value = this.evaluate(stmt.initializer);
        }
        this.environment.define(stmt.name.lexeme, value);
    }

    visitBlock(stmt :Block) :void {
        this.executeBlock(stmt.statements, new Environment(this.environment));
    }

    visitIf(stmt :If) :void {
        if(this.isTruthy(this.evaluate(stmt.condition))) {
            this.execute(stmt.thenBranch);
        } else if (stmt.elseBranch !== null) {
            this.execute(stmt.elseBranch);
        }
    }

    visitWhile(stmt :While) :void {
        while(this.isTruthy(this.evaluate(stmt.condition))) {
            this.execute(stmt.body);
        }
    }

    visitLoxFunction(stmt :LoxFunction) :void {
        const func :LoxNativeFunction = new LoxNativeFunction(stmt, this.environment, false);
        this.environment.define(stmt.name.lexeme, func);
    }

    visitReturn(stmt :Return) :void {
        let value :Expr | null = null;
        if(stmt.value !== null) value = this.evaluate(stmt.value);
        throw new ReturnValue(value);
    }

    visitClass(stmt :Class) {
        let superclass :any = null;
        if(stmt.superclass !== null) {
            superclass = this.evaluate(stmt.superclass);
            if(!(superclass instanceof LoxClass)) {
                throw new RuntimeError(stmt.superclass.name, 
                                       "Superclass must be a class.");
            }
        }

        this.environment.define(stmt.name.lexeme, null);

        if(stmt.superclass !== null) {
            this.environment = new Environment(this.environment);
            this.environment.define("super", superclass);
        }

        let methods :Map<string, LoxNativeFunction> = new Map();
        for(const method of stmt.methods) {
            const func = new LoxNativeFunction(method, this.environment, method.name.lexeme === "init");
            methods.set(method.name.lexeme, func);
        }

        const klass :LoxClass = new LoxClass(stmt.name.lexeme, superclass, methods);

        if(superclass !== null) {
            if(this.environment.enclosing !== null) {
                this.environment = this.environment.enclosing;
            }
        }

        this.environment.assign(stmt.name, klass);
    }

    executeBlock(statements :Stmt[], environment :Environment) :void {
        const previous = this.environment;
        try {
            this.environment = environment;
            for(let statement of statements) {
                this.execute(statement);
            }

        } finally {
            this.environment = previous;
        }
    }

    visitBinary(expr :Binary) :any {
        const left :any = this.evaluate(expr.left);
        const right :any = this.evaluate(expr.right);

        const type = expr.operator.type;

        if(type === TokenType.MINUS) {
            this.checkNumberOperands(expr.operator, left, right);
            return parseFloat(left) - parseFloat(right);

        } else if (type === TokenType.SLASH) {
            this.checkNumberOperands(expr.operator, left, right);
            return parseFloat(left) / parseFloat(right);

        } else if (type === TokenType.STAR) {
            this.checkNumberOperands(expr.operator, left, right);
            return parseFloat(left) * parseFloat(right);

        } else if (type === TokenType.PLUS) {
            if (typeof(left) === "string" && typeof(right) === "string") {
                return left.slice(0, left.length-1) + right.slice(1, right.length);

            } else if(!isNaN(parseFloat(left)) && !isNaN(parseFloat(right))) {
                return parseFloat(left) + parseFloat(right);

            } else if (typeof(left) === "string") {
                return left.slice(0, left.length-1) + right+'"';

            } else if (typeof(right === "string")) {
                return '"' + left + right.slice(1, right.length);

            } else {
                throw new RuntimeError(expr.operator, "Operands must be two numbers or strings.");
            }

        } else if (type === TokenType.GREATER) {
            this.checkNumberOperands(expr.operator, left, right);
            return parseFloat(left) > parseFloat(right);

        } else if (type === TokenType.GREATER_EQUAL) {
            this.checkNumberOperands(expr.operator, left, right);
            return parseFloat(left) >= parseFloat(right);

        } else if (type === TokenType.LESS) {
            this.checkNumberOperands(expr.operator, left, right);
            return parseFloat(left) < parseFloat(right);

        } else if (type === TokenType.LESS_EQUAL) {
            this.checkNumberOperands(expr.operator, left, right);
            return parseFloat(left) <= parseFloat(right);

        } else if (type === TokenType.BANG_EQUAL) {
            return !this.isEqual(left, right);

        } else if (type === TokenType.EQUAL_EQUAL) {
            return this.isEqual(left, right);
        }

        return null;
    }

    visitGrouping(expr :Grouping) :any {
        return this.evaluate(expr.expression);
    }

    visitLiteral(expr :Literal) :any {
        return expr.value;
    }

    isTruthy(val :any) :boolean {
        if(val === null) return false;
        if (typeof(val) === "boolean") return val;
        return true;
    }

    visitUnary(expr :Unary) :any {
        const right :any = this.evaluate(expr.right);
        if (expr.operator.type === TokenType.MINUS) {
            this.checkNumberOperand(expr.operator, right);
            return -(parseFloat(right));
        }
        else if (expr.operator.type === TokenType.BANG) return !this.isTruthy(right);
        return null;
    }


    lookupVariable(name :Token, expr :Expr) :any {
        if(this.locals.has(expr)) {
            const distance :Number = this.locals.get(expr);
            return this.environment.getAt(distance, name.lexeme);
        } else {
            return this.globals.get(name);
        }
    }

    visitVariable(expr :Variable) :any {
        return this.lookupVariable(expr.name, expr);
    }

    visitAssign(expr :Assign) :any {
        const value :any = this.evaluate(expr.value);
        if(this.locals.has(expr)) {
            const distance :Number = this.locals.get(expr);
            return this.environment.assignAt(distance, name, value);
        } else {
            this.globals.assign(expr.name, value);
        }
        return value;
    }

    visitLogical(expr :Logical) :any {
        const left :any = this.evaluate(expr.left);

        if(expr.operator.type === TokenType.OR) {
            if(this.isTruthy(left)) return left;
        } else {
            if(!this.isTruthy(left)) return left;
        }

        return this.evaluate(expr.right);
    }

    visitCall(expr :Call) :any {
        let callee = this.evaluate(expr.callee);

        let args :any[] = [];
        for(const arg of expr.args) {
            args.push(this.evaluate(arg));
        }

        if(!(isLoxCallable(callee))) {
            throw new RuntimeError(expr.paren, "Can only call functions and classes.");
        }

        const func :LoxCallable = callee;

        if(args.length != func.arity()) {
            throw new RuntimeError(expr.paren, 
                        `Expected ${func.arity()} arguments but got ${args.length}.`);
        }

        return func.call(this, args);
    }

    visitGet(expr :Get) {
        let object :any = this.evaluate(expr.object);

        if(object instanceof LoxInstance) {
            return object.get(expr.name);
        }

        throw new RuntimeError(name, 
                        `Undefined property '${expr.name}'.`);
    }

    visitSet(expr :LoxSet) {
        const object :LoxSet = this.evaluate(expr.object);

        if(!(object instanceof LoxInstance)) {
            throw new RuntimeError(expr.name, "Only instances have fields.");
        }

        const value :any = this.evaluate(expr.value);

        object.set(expr.name, value);

        return value;
    }

    visitThis(expr :This) :any {
        return this.lookupVariable(expr.keyword, expr);
    }

    visitSuper(expr :Super) :any {
        const distance :number = this.locals.get(expr);
        const superclass :LoxClass = this.environment.getAt(distance, "super");
        const object :LoxInstance = this.environment.getAt(distance-1, "this");

        const method :LoxNativeFunction | undefined = superclass.findMethod(expr.method.lexeme);
        if(!method) throw new Error("Super method undefined.");
        return method.bind(object);
    }
}

class ReturnValue extends Error {
    value :any;

    constructor(value :any) {
        super();
        this.value = value;
    }
}

class RuntimeError extends Error {
    token :Token;
    message: string;
    constructor(token :Token, message: string) {
        super(message);
        this.token = token;
        this.message = message;
    }
}

export {
    RuntimeError,
    Interpreter,
    ReturnValue
}
