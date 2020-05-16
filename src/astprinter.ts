import { Expr, Binary, Grouping, Literal, Unary, ExprVisitor } from './ast';

class AstPrinter implements ExprVisitor {

    print(expr :Expr) :string {
        return expr.accept(this);
    }

    parenthesize(name: string, ...exprs :Expr[]) :string {
        let builder = ["(",name];

        for(let expr of exprs) {
            builder.push(" ");
            builder.push(expr.accept(this));
        }

        builder.push(")");

        return builder.join("");
    }


    rpn(name: string, ...exprs :Expr[]) :string {
        let builder = [,name];

        for(let expr of exprs) {
            builder.unshift(" ");
            builder.unshift(expr.accept(this));
        }

        return builder.join("");
    }

    visitBinary(expr :Binary) {
        return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
    }

    visitGrouping(expr :Grouping) {
        return this.parenthesize("group", expr.expression);
    }

    visitLiteral(expr :Literal) {
        if (expr.value === null) return "nil";
        return expr.value.toString();
    }

    visitUnary(expr :Unary) {
        return this.parenthesize(expr.operator.lexeme, expr.right);
    }
}

export {
    AstPrinter
}
