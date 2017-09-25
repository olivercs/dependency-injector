
import Injector from './index.js';
  
const injector = new Injector();

function Injectable(target) {
  injector.register(target);
}

@Injectable class A {
  
  static get deps() {
    return ['B', 'C'];
  }

  constructor(B, C) {
    console.log('INIT:', this, B, C);
  }
  
}

@Injectable class B {
  static get deps () {
    return ['D', 'C'];
  }
}

@Injectable class C {
   static get singleton() {
     return true;
   }
}

@Injectable class D  {
    static get deps () {
    return [];
  }
}

injector.invoke(A);
console.log(injector.tree);