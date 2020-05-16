import { Token } from "./tokentype";

class Expr {
    left : any = null;
    constructor() { }

    accept(visitor :ExprVisitor) :any { }
}

interface ExprVisitor {
    visitBinary(s :Expr) :void;
    visitGrouping(s :Expr) :void;
    visitLiteral(s :Expr) :void;
    visitUnary(s :Expr) :void;
    visitVariable(s :Expr) :void;
    visitAssign(s :Expr) :void;
    visitLogical(s :Expr) :void;
    visitCall(s :Expr) :void;
    visitGet(s :Expr) :void;
    visitSet(s :Expr) :void;
    visitThis(s :Expr) :void;
    visitSuper(s :Expr) :void;
}

class Binary extends Expr {
    left: Expr;
    operator :Token;
    right :Expr;

    constructor(left: Expr, operator :Token, right :Expr) {
        super();
        this.left = left;
        this.operator = operator;
        this.right = right;
    }

    accept(visitor :ExprVisitor) :any {
        return visitor.visitBinary(this);
    }

}

class Grouping extends Expr {
    expression :Expr;

    constructor(expression :Expr) {
        super();
        this.expression = expression;
    }

    accept(visitor :ExprVisitor) :any {
        return visitor.visitGrouping(this);
    }

}

class Literal extends Expr {
    value :any;

    constructor(value :any) {
        super();
        this.value = value;
    }

    accept(visitor :ExprVisitor) :any {
        return visitor.visitLiteral(this);
    }

}

class Unary extends Expr {
    operator :Token;
    right :Expr;

    constructor(operator :Token, right :Expr) {
        super();
        this.operator = operator;
        this.right = right;
    }

    accept(visitor :ExprVisitor) :any {
        return visitor.visitUnary(this);
    }
}

class Assign extends Expr {
    name :Token;
    value :Expr;
    constructor(name :Token, value :Expr) {
        super();
        this.name = name;
        this.value = value;
    }

    accept(visitor :ExprVisitor) :any {
        return visitor.visitAssign(this);
    }

}

class Variable extends Expr {
    name :Token;

    constructor(name :Token) {
        super();
        this.name = name;
    }

    accept(visitor :ExprVisitor) :any {
        return visitor.visitVariable(this);
    }
}

class Logical extends Expr {
    left: Expr;
    operator :Token;
    right: Expr;

    constructor(left: Expr, operator :Token, right :Expr) {
        super();
        this.left = left;
        this.operator = operator;
        this.right = right;
    }

    accept(visitor :ExprVisitor) :any {
        return visitor.visitLogical(this);
    }

}

class Call extends Expr {
    callee :Expr;
    paren :Token;
    args :Expr[];

    constructor(callee :Expr, paren :Token, args :Expr[]){
        super();
        this.callee = callee;
        this.paren = paren;
        this.args = args;
    }

    accept(visitor :ExprVisitor) :any {
        return visitor.visitCall(this);
    }
}

class Get extends Expr {
    object :Expr;
    name :Token;
    
    constructor(object :Expr, name :Token) {
        super();
        this.object = object;
        this.name = name;
    }

    accept(visitor :ExprVisitor) :any {
        return visitor.visitGet(this);
    }

}

class LoxSet extends Expr {
    object :Expr;
    name :Token;
    value :Expr;

    constructor(object :Expr, name :Token, value :Expr) {
        super();
        this.object = object;
        this.name = name;
        this.value = value;
    }

    accept(visitor :ExprVisitor) :any {
        return visitor.visitSet(this);
    }
}

class This extends Expr {
    keyword :Token;

    constructor(keyword :Token) {
        super();
        this.keyword = keyword;
    }

    accept(visitor :ExprVisitor) :any {
        return visitor.visitThis(this);
    }
}

class Super extends Expr {
    keyword :Token;
    method :Token;

    constructor(keyword :Token, method :Token) {
        super();
        this.keyword = keyword;
        this.method = method;
    }

    accept(visitor :ExprVisitor) :any {
        return visitor.visitSuper(this);
    }

}

export {
    Expr,
    Binary, Grouping, Literal, 
    Unary, Variable, Assign,
    Logical, Call, Get, LoxSet,
    This, Super,
    ExprVisitor
}


