import { Expr, Binary, Grouping, Literal, Unary, ExprVisitor, Variable, Assign, Logical, Call, Get, LoxSet, This, Super } from './ast';
import { Stmt, StmtVisitor, Print, Expression, Var, Block, If, While, LoxFunction, Return, Class } from './stmt';
import { Interpreter } from './interpreter';
import { Token } from './tokentype';
import { Lox } from './lox';

enum FunctionType {
    NONE,
    FUNCTION,
    METHOD,
    INITIALIZER
}

enum ClassType {
    NONE,
    CLASS,
    SUBCLASS
}

class Resolver implements ExprVisitor, StmtVisitor {
    interpreter :Interpreter;
    scopes : any[];
    lox :Lox;

    currentFunction :FunctionType = FunctionType.NONE;
    currentClass :ClassType = ClassType.NONE;

    constructor(lox: Lox, interpreter :Interpreter) {
        this.lox = lox;
        this.interpreter = interpreter;
        this.scopes = [];
    }

    beginScope() {
        this.scopes.push(new Map());
    }

    endScope() {
        this.scopes.pop();
    }

    resolveStatement(stmt :Stmt) {
        stmt.accept(this);
    }

    resolveExpression(expr :Expr) {
        expr.accept(this);
    }

    resolveStatements(statements :Stmt[]) {
        for(let stmt of statements) {
            this.resolveStatement(stmt);
        }
    }

    resolveLocal(expr :Expr, name :Token) {
        for(let i=this.scopes.length-1;i >=0;i--) {
            if(this.scopes[i].has(name.lexeme)) {
                this.interpreter.resolve(expr, this.scopes.length -1 -i);
                return;
            }
        }
    }

    resolveFunction(func :LoxFunction, type:FunctionType) {
        let enclosingFunction :FunctionType = this.currentFunction;
        this.currentFunction = type;

        this.beginScope();
        for(const param of func.params) {
            this.declare(param);
            this.define(param);
        }

        this.resolveStatements(func.body);
        this.endScope();

        this.currentFunction = enclosingFunction;
    }

    declare(name :Token) {
        if(this.scopes.length === 0) return;
        if(this.scopes[this.scopes.length-1].has(name.lexeme)) {
            this.lox.tokenError(name, "Variable with this name already declared in this scope.");
        }
        this.scopes[this.scopes.length-1].set(name.lexeme, false);
    }

    define(name :Token) {
        if(this.scopes.length === 0) return;
        this.scopes[this.scopes.length-1].set(name.lexeme, true);
    }

    visitBlock(stmt :Block) :void {
        this.beginScope();
        this.resolveStatements(stmt.statements);
        this.endScope();
    }

    visitVar(stmt :Var) :void {
        this.declare(stmt.name);
        if(stmt.initializer !== null) {
            this.resolveExpression(stmt.initializer);
        }
        this.define(stmt.name);
    }

    visitLoxFunction(stmt :LoxFunction) {
        this.declare(stmt.name);
        this.define(stmt.name);
        this.resolveFunction(stmt, FunctionType.FUNCTION);
    }

    visitVariable(expr :Variable) {
        if(!(this.scopes.length === 0)
           && this.scopes[this.scopes.length-1].get(expr.name.lexeme) === false
        ) {
            this.lox.tokenError(expr.name, 
                           "Cannot read local variable in its own initalizer");
        }

        this.resolveLocal(expr, expr.name);
    }

    visitAssign(expr :Assign) {
        this.resolveExpression(expr.value);
        this.resolveLocal(expr, expr.name);
    }

    visitBinary(expr :Binary) {
        this.resolveExpression(expr.left);
        this.resolveExpression(expr.right);
    }

    visitCall(expr :Call) {
        this.resolveExpression(expr.callee);

        for (let arg of expr.args) {
            this.resolveExpression(arg);
        }
    }

    visitGrouping(expr :Grouping) {
        this.resolveExpression(expr.expression);
    }

    visitLiteral(expr :Literal) {
        return;
    }

    visitLogical(expr :Logical) {
        this.resolveExpression(expr.left);
        this.resolveExpression(expr.right);
    }

    visitUnary(expr :Unary) {
        this.resolveExpression(expr.right);
    }

    visitExpression(stmt :Expression) {
        this.resolveExpression(stmt.expression);
    }

    visitGet(expr :Get) {
        this.resolveExpression(expr.object);
    }

    visitSet(expr :LoxSet) {
        this.resolveExpression(expr.value);
        this.resolveExpression(expr.object);
    }

    visitThis(expr :This) {
        if(this.currentClass === ClassType.NONE) {
            this.lox.tokenError(expr.keyword, 
                                "Cannot use 'this' outside of a class.");
            return;
        }
        this.resolveLocal(expr, expr.keyword);
    }

    visitIf(stmt :If) {
        this.resolveExpression(stmt.condition);
        this.resolveStatement(stmt.thenBranch);
        if(stmt.elseBranch !== null) this.resolveStatement(stmt.elseBranch);
    }

    visitPrint(stmt :Print) {
        this.resolveExpression(stmt.expression);
    }

    visitReturn(stmt :Return) {
        if(this.currentFunction == FunctionType.NONE) {
            this.lox.tokenError(stmt.keyword, "Cannot return from top level code.");
        }
        if(stmt.value !== null) {
            if(this.currentFunction === FunctionType.INITIALIZER) {
                this.lox.tokenError(stmt.keyword, "Cannot return from initalizer.");
            }
            this.resolveExpression(stmt.value);
        }
    }

    visitWhile(stmt :While) {
        this.resolveExpression(stmt.condition);
        this.resolveStatement(stmt.body);
    }

    visitClass(stmt :Class) {
        const enclosingClass = this.currentClass;
        this.currentClass = ClassType.CLASS;

        this.declare(stmt.name);


        if(stmt.superclass !== null) {
            if(stmt.name.lexeme === stmt.superclass.name.lexeme) {
                this.lox.tokenError(stmt.superclass.name, "A class cannot inherit from itself.");
            }
            this.currentClass = ClassType.SUBCLASS;
            this.beginScope();
            this.scopes[this.scopes.length-1].set("super", true);
            this.resolveExpression(stmt.superclass);
        }

        this.beginScope();
        this.scopes[this.scopes.length-1].set("this", true);

        for(let method of stmt.methods) {
            let declaration = FunctionType.METHOD;
            if(method.name.lexeme === "init") {
                declaration = FunctionType.INITIALIZER;

            }
            this.resolveFunction(method, declaration);
        }

        this.endScope();
        if(stmt.superclass !== null) this.endScope();

        this.define(stmt.name);

        this.currentClass = enclosingClass;
    }

    visitSuper(expr :Super) {
        if(this.currentClass === ClassType.NONE) {
            this.lox.tokenError(expr.keyword, "Cannot use 'super' outside class.");
        } else if (this.currentClass !== ClassType.SUBCLASS) {
            this.lox.tokenError(expr.keyword, "Cannot use 'super' in a class without a super class.");
        }
        this.resolveLocal(expr, expr.keyword);
    }

}

export {
    Resolver
}
