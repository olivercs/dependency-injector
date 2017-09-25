export default class Injector {
  
    constructor() {
      this.classes = {};
      this.instances = [];
      this.tree = { name: 'root' };
      this.currentNode = this.tree;
    }
  
    register(theClass) {
      
      if(this.has(theClass.name)) {
          throw new Error(`The class you're trying to register already exist`);
      }
      
      this.classes[theClass.name] = theClass;
      return theClass;
    }
    
    has(className) {
      return !! this.classes[className];
    }
  
    get(className) {
           
       if(this.classes[className].singleton) {
        const instancesOfClass = this.instances.filter(instance => instance.className === className);
        if(instancesOfClass.length) {
          return instancesOfClass[0].instance;
        }
      }
  
      return this.instantiate(className);
      
    }
  
    createNode(theClass) {
    
      const deps = theClass.deps || [];
      
      this.currentNode[theClass.name] = {};
      
      deps.forEach(dep => {
        this.currentNode[theClass.name][dep] = {
          parent:  this.currentNode[theClass.name],
          name: dep
        };
      });
      
      this.currentNode[theClass.name].name = theClass.name;
      this.currentNode[theClass.name].parent = this.currentNode;
    }
  
    circulaDepDetection(className) {
      const deps = [className, this.currentNode.name];
      let node =  this.currentNode;
      
      while(node = node.parent) {
        deps.push(node.name);
        if(className === node.name) {
          console.error('Path:', deps.join(' -> '));
          throw new Error('Circular Dependency detected');
        }
      }
      
    }
    
    invoke(theClass) {
  
      if(!theClass) {
        throw new Error('The Class cannot be null / undefined');
      }
      
      this.createNode(theClass);
      this.circulaDepDetection(theClass.name);
  
      const deps = theClass.deps || [];
      
      if(theClass.deps) {
        this.currentNode = this.currentNode[theClass.name];
      }
      
      const depInstances = deps.map(dep =>this.get(dep));
      const instance = new theClass(...depInstances);
      deps.forEach((dep, index) => instance[dep] = depInstances[index]);
  
      return instance;
  
      
    }
  
    instantiate(className) {
       
      if(!className) {
        throw new Error('className cannot be null / undefined');
      }
      
      const theClass = this.classes[className];
      const instance = this.invoke(theClass);
      
      this.instances.push({id: Symbol(className), className, instance });
      return instance;
     
    }
}

