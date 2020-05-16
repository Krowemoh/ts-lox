import { LoxCallable } from './loxcallable';
import { Interpreter, ReturnValue } from './interpreter';
import { LoxFunction } from './stmt';
import { Environment } from './environment';
import { LoxInstance } from './loxclass';

class LoxNativeFunction implements LoxCallable {
    declaration :LoxFunction;
    closure :Environment;
    discrim :string;
    isInitalizer :boolean;

    constructor(declaration :LoxFunction, closure :Environment, isInitalizer :boolean) {
        this.discrim = "LoxCallable";
        this.declaration = declaration;
        this.closure = closure;
        this.isInitalizer = isInitalizer;
    }

    call(interpreter :Interpreter, args :any[]) :any {
        const environment :Environment = new Environment(this.closure);

        for(let i=0;i<this.declaration.params.length;i++) {
            environment.define(this.declaration.params[i].lexeme, args[i]);
        }

        try {
            interpreter.executeBlock(this.declaration.body, environment);
        } catch (error) {
            return error.value;
        }

        if(this.isInitalizer) return this.closure.getAt(0, "this");

        return null;
    }

    bind(instance :LoxInstance) :LoxNativeFunction {
        const environment :Environment = new Environment(this.closure);
        environment.define("this", instance);
        return new LoxNativeFunction(this.declaration, environment, this.isInitalizer);
    }

    arity() :Number {
        return this.declaration.params.length;
    }

    toString() :string {
        return `<fn ${this.declaration.name.lexeme}>`;
    }
}

export {
    LoxNativeFunction
}
