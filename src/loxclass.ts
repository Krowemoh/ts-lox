import { LoxCallable } from "./loxcallable";
import { Interpreter, RuntimeError } from "./interpreter";
import { Token } from "./tokentype";
import { LoxNativeFunction } from "./loxnativefunction";

class LoxInstance {
    klass :LoxClass;
    fields :Map<string, any>;

    constructor(klass :LoxClass) {
        this.klass = klass;
        this.fields = new Map();
    }

    get(name :Token) :any {
        if(this.fields.has(name.lexeme)) {
            return this.fields.get(name.lexeme);
        }

        const method :LoxNativeFunction | undefined = this.klass.findMethod(name.lexeme);
        if (method) return method.bind(this);

        throw new RuntimeError(name, `Undefined property '${name.lexeme}'.`);
    }

    set(name :Token, value :any) {
        this.fields.set(name.lexeme, value);
    }

    toString() :string {
        return this.klass.name + " instance";
    }
}

class LoxClass implements LoxCallable {
    discrim :string = "LoxCallable";
    name :string;
    superclass :LoxClass;
    methods :Map<string, LoxNativeFunction>;

    constructor(name :string, superclass: LoxClass, methods :Map<string, LoxNativeFunction>) {
        this.name = name;
        this.superclass = superclass;
        this.methods = methods;
    }

    findMethod(name :string) :LoxNativeFunction | undefined{
        if(this.methods.has(name)) return this.methods.get(name);

        if(this.superclass !== null) {
            return this.superclass.findMethod(name);
        }
    }

    call(interpreter :Interpreter, args :any[]) :any {
        const instance :LoxInstance = new LoxInstance(this);
        const initializer :LoxNativeFunction | undefined = this.findMethod("init");
        if(initializer) {
            initializer.bind(instance).call(interpreter, args);
        }
        return instance;
    }

    arity() :Number {
        const initializer :LoxNativeFunction | undefined = this.findMethod("init");
        if(initializer) {
            return initializer.arity();
        }
        return 0;
    }

    toString() {
        return this.name;
    }
}

export {
    LoxClass, LoxInstance
}
