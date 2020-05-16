import { Expr, Variable } from "./ast";
import { Token } from "./tokentype";

class Stmt {
    constructor() { }

    accept(visitor :StmtVisitor) :any { }
}

interface StmtVisitor {
    visitPrint(s :Stmt) :void;
    visitExpression(s :Stmt) :void;
    visitVar(s :Stmt) :void;
    visitBlock(s :Stmt) :void;
    visitIf(s :Stmt) :void;
    visitWhile(s :Stmt) :void;
    visitLoxFunction(s :Stmt) :void;
    visitReturn(s :Stmt) :void;
    visitClass(s :Stmt) :void;
}

class Expression extends Stmt {
    expression : Expr;

    constructor(expression :Expr) {
        super();
        this.expression = expression;
    }

    accept(visitor :StmtVisitor) :any {
        return visitor.visitExpression(this);
    }

}

class Print extends Stmt {
    expression : Expr;

    constructor(expression :Expr) {
        super();
        this.expression = expression;
    }

    accept(visitor :StmtVisitor) :any {
        return visitor.visitPrint(this);
    }
}

class Var extends Stmt {
    name :Token;
    initializer :Expr | null = null;

    constructor(name :Token, initializer :Expr | null = null) {
        super();
        this.name = name;
        this.initializer = initializer;
    }

    accept(visitor :StmtVisitor) :any {
        return visitor.visitVar(this);
    }
}

class Block extends Stmt {
    statements :Stmt[];

    constructor(statements :Stmt[]) {
        super();
        this.statements = statements;
    }

    accept(visitor :StmtVisitor) :any {
        return visitor.visitBlock(this);
    }

}

class If extends Stmt {
    condition: Expr;
    thenBranch: Stmt;
    elseBranch: Stmt | null;

    constructor(condition: Expr, thenBranch :Stmt, elseBranch: Stmt | null = null) {
        super();
        this.condition = condition;
        this.thenBranch = thenBranch;
        this.elseBranch = elseBranch;
    }

    accept(visitor :StmtVisitor) :any {
        return visitor.visitIf(this);
    }
}

class While extends Stmt {
    condition :Expr;
    body :Stmt;

    constructor(condition :Expr, body :Stmt) {
        super();
        this.condition = condition; 
        this.body = body;
    }

    accept(visitor :StmtVisitor) :any {
        return visitor.visitWhile(this);
    }

}

class LoxFunction extends Stmt {
    name :Token;
    params :Token[];
    body :Stmt[];

    constructor(name :Token, params :Token[], body :Stmt[]) {
        super();
        this.name = name;
        this.params = params;
        this.body = body;
    }

    accept(visitor :StmtVisitor) :any {
        return visitor.visitLoxFunction(this);
    }
}

class Return extends Stmt {
    keyword :Token;
    value :Expr | null;

    constructor(keyword :Token, value :Expr | null) {
        super();
        this.keyword = keyword;
        this.value = value;
    }

    accept(visitor :StmtVisitor) :any {
        return visitor.visitReturn(this);
    }

}

class Class extends Stmt {
    name :Token;
    methods :LoxFunction[];
    superclass :Variable | null;

    constructor(name :Token, superclass :Variable | null, methods :LoxFunction[]) {
        super();
        this.name = name;
        this.superclass = superclass;
        this.methods = methods;
    }

    accept(visitor :StmtVisitor) :any {
        return visitor.visitClass(this);
    }
}

export {
    Stmt, Print, Expression, 
    Var, Block, If, While, 
    LoxFunction, Return, Class,
    StmtVisitor,
}
