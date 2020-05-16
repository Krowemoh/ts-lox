import { Interpreter } from "./interpreter";

interface LoxCallable {
    discrim :string;
    arity() :Number;
    call(interpreter :Interpreter, args :any[]) :any;
}

function isLoxCallable(obj :any): obj is LoxCallable {
    return obj.discrim === "LoxCallable";
} 

export {
    LoxCallable, isLoxCallable
}
