const commandListener = () => {
  let commands = ['rgtys', 'monra']
  window.document.addEventListener('keyup', e => {
    let key = e.key;
    let lenght = 0;
    let stringKeyboard = '';
    let status = -1;
    let commandFinded = '';
    arrayKeysValues.push(key);
    lenght = arrayKeysValues.length;
    if(lenght === 10){
      stringKeyboard = arrayKeysValues.toString();
      stringKeyboard = stringKeyboard.replace(/,/g, '');
      for(let i = 0; i < commands.length; i++){
        status = stringKeyboard.search(commands[i])
        if(status >= 0){
          commandFinded = commands[i];
          break;
        }
      }
      if(commandFinded) {
        switch(commandFinded){
          case 'rgtys':
            runRgtysFunction()
            break;
        }          
      }
      arrayKeysValues = [];
    }
  });
}