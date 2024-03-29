import { Expositor } from './expositor.js';
import { TextBlock } from './textblock.js';
import { Quadro } from './quadro.js';
import * as tools from './ferramentasQuadro.js';

// https://www.youtube.com/watch?v=7PYvx8u_9Sk


// modal das instruções esta ativado \|/
var myModal = new bootstrap.Modal(document.getElementById('instructionsModal'), {})
myModal.toggle()

let canvas = new Quadro(document.getElementById("canvas"), document.getElementById("canvas").getContext("2d"));
canvas.detectAction();
let sizeX = canvas.canvas_width;
let sizeY = canvas.canvas_height;
let selectedExpositor;
let array;

fetch('/fetchMap')
    .then(response => response.json())
    .then(data => {
        array = data;

        const numExpos = array[0].numExpos;
        console.log(data)
        let index = 0


        array.shift();

        array.forEach(element => {
            if(index < numExpos){  
                canvas.addExpositores(new Expositor(element.id, element.posX, element.posY,  element.width, element.height, element.color , 
                    element.products, element.capacity, element.divisions, element.storeSection, element.storeSectionColor )); 
                
            }
        else{
                canvas.addTextBlock(new TextBlock(element.id, element.posX, element.posY, element.value, parseInt(element.angle)));
        }
        index++;
        });
    }) 

var addExpo = document.getElementById("addExpositor")
var rotateExpo = document.getElementById("rotateExpositor")
var exclude = document.getElementById("exclude")
var resizeExpo = document.getElementById("resizeExpositor")
var detailExpo = document.getElementById("detailExpositor")
var capacity = document.getElementById("selectCapacity")
var departmants = document.getElementById("selectSector")
var divisions = document.getElementById("selectDivision")
var produtos = document.getElementById("addProdutos")
var texts = document.getElementById("addText")
var editMap = document.getElementById("EditMap")
var discardAlteration = document.getElementById("DiscardAlteration")
var discardExpoInfo = document.getElementById("discardExpoInfo")
var mapFormField = document.getElementById("mapa")
 

addExpo.onmousedown = (event) =>{
    canvas.addExpositores(new Expositor(canvas.getNewShapeID(),sizeX/2,sizeY/2, 20, 60, 'grey'));
}
 
texts.onmousedown = (event) =>{
    const myModal = new bootstrap.Modal(document.getElementById('addTextBackdrop'));
    const addTextBtn = document.getElementById('addTextBtn')
    const textInput = document.getElementById('textInput')
    
    addTextBtn.onclick = (event) =>{
        canvas.addTextBlock(new TextBlock(canvas.getNewTextID(),sizeX/2,sizeY/2,textInput.value, 0));
        console.log(textInput.value);
        textInput.value = '';
    }

    CancelTextBtn.onclick = (event) =>{
        textInput.value = '';
    }

    myModal.toggle();
    myModal.show();
}

rotateExpo.onmousedown = (event) =>{
    try {
        if(canvas.selectedExpo){   
            canvas.getShapes()[canvas.getCurrentExpositorIndex()].rotate_expositor(); 
        }
        else if(canvas.selectedText){   
            var text = canvas.getTexts()[canvas.getCurrentExpositorIndex()];
            canvas.rotateText(text)
            console.log(text);
        }
        else
            throw new TypeError('');

        canvas.resizeShapes = [];
        
    } catch (error) {
        window.alert("Selecione um expositor/texto para realizar esta ação");
    }
    
    canvas.draw_shapes();
} 

exclude.onmousedown = (event) =>{ 
    try {
        if(canvas.selectedExpo){ 

            const alteredShapes = tools.excludeExpositores(canvas.getShapes(), canvas.getSelected(canvas.getShapes()));
            canvas.setShapes(alteredShapes);
            canvas.resizeShapes = [];
        }
        else if(canvas.selectedText){ 
            const alteredTexts = tools.excludeText(canvas.getTexts(),canvas.getSelected(canvas.getTexts()));
            canvas.setTexts(alteredTexts);          
        }
    
        else
            throw new TypeError('');

    } catch (error) {
        console.log(error);
        window.alert("Selecione um expositor para realizar esta ação"); 
    }
    
    canvas.draw_shapes();
}


resizeExpo.onmousedown = (event) =>{
    try {
        if(canvas.selectedExpo){
            let selectedExpositor = canvas.getSelected(canvas.getShapes())
            
            const [shape, resizers] = tools.resizers(canvas.getShapes(),  canvas.getResizeShapes(), selectedExpositor)

            canvas.setSelectedShape(shape)
            canvas.setResizeShapes(resizers) 
        }
        else
            throw new TypeError('');

    } catch (error) {
        window.alert("Selecione um expositor para realizar esta ação"); 
    }
    
    canvas.draw_shapes();
}
 
detailExpo.onmousedown = (event) =>{
    produtos.innerHTML = ''

    try {
        if(canvas.selectedExpo){
            selectedExpositor = canvas.getCurrentExpositor(); 

            capacity.onchange = (event) => {
                var inputText = event.target.value;
                selectedExpositor.capacity = parseInt(inputText);
        
                createProductSpaces(inputText);
            }

            departmants.onchange = (event) => {
                // https://www.youtube.com/watch?v=exRAM1ZWm_s
                var inputText = event.target.value;
                selectedExpositor.storeSection = parseInt(inputText);
        
                fetch("/fetchColor?seccaoId=" + inputText)
                .then(response => response.json())
                .then(data => {
                    var cor = data.cor;
        
                    selectedExpositor.give_colorSection(cor);
                });
        
                createProductSpaces(capacity.value);
            }

            
            divisions.onchange = (event) => {
                var inputText = event.target.value;
                selectedExpositor.divisions = parseInt(inputText);
            }

            produtos.onchange = (event) => {
                var inputSpaceNumber = event.target.id.charAt(event.target.id.length - 1)

                if( selectedExpositor.products[inputSpaceNumber] != ''){
                    selectedExpositor.products[inputSpaceNumber] = event.target.value;
                }else{
                    selectedExpositor.products.push(event.target.value) ;
                }
            }

            if(selectedExpositor.capacity === 0){
                capacity.value = selectedExpositor.capacity;
                selectedExpositor.products = [];
                
            }else{
                capacity.value = selectedExpositor.capacity;
                createProductSpaces(capacity.value);
            }
        
            if(selectedExpositor.storeSection === 0){
                departmants.value = " ";
            }else{
                departmants.value =  selectedExpositor.storeSection.toString(); 
            }
        
            if(selectedExpositor.divisions === 0){
                divisions.value = "0";
            }else{
                divisions.value =  selectedExpositor.divisions.toString();
            }
        }
        else
            throw new TypeError('');
    } catch (error) {
        window.alert("Selecione um expositor para realizar esta ação");
    }  

    
    const myModal = new bootstrap.Modal(document.getElementById('staticBackdrop'));
    const myModalTitle = new bootstrap.Modal(document.getElementById('staticBackdropLabel'));

    myModalTitle._element.innerText = 'Expositor ' + selectedExpositor.id;

    
    function createProductSpaces(numProducts) {
        const node = ''

        if(capacity.value !== '0' && departmants.value !== ' '){
            fetch("/fetchProducts?seccaoId=" + selectedExpositor.storeSection)
            .then(response => response.json())
            .then(data => {
                var products = data.products;


                produtos.innerHTML = '';
                    
                for(let i = 0; i<numProducts; i++ ){
                    const node = `
                        <div class="col-6">
                            <div class="input-group my-1 needs-validation py-2">
                                <select id="selectProduct${i}" class="form-select" required> 
                                    <option class="is-invalid" disabled selected value=' '>Selecionar Produto</option>
                                </select><div class="invalid-feedback">Por Favor selecione um produto</div> 
                            </div>
                        </div>
                    `; 

                    produtos.innerHTML += node
                }

                var numChilds =  produtos.childElementCount;


                for (let index = 0; index < numChilds; index++) {
                    var selector = document.getElementById("selectProduct"+index);

                    products.forEach(element => {
                        console.log(element.id);
                        console.log(element.nome);
                        let newOption = new Option(element.nome, element.id);

                        selector.add(newOption,undefined);
                    });
                }

                var numChildsAssigned = selectedExpositor.products.length;

                if(numChildsAssigned > 0){
                    for(let i = 0; i<numChildsAssigned; i++ ){
                        document.getElementById("selectProduct"+i).value = [selectedExpositor.products[i]]
                    }
                        
                }  
                
                else{
                    for(let i = 0; i<numChildsAssigned; i++ ){
                        document.getElementById("selectProduct"+i).value = 0
                    }
            
                }              
                
            });
        }
    }


    myModal.toggle();
    myModal.show();

    discardExpoInfo.onclick = (event) =>{
        produtos.innerHTML = '';
        selectedExpositor.products = [];
        selectedExpositor.capacity = 0;
        selectedExpositor.divisions = 0;
        selectedExpositor.storeSection = 0;
        selectedExpositor.storeSectionColor = '';

    }
} 


editMap.onmousedown = (event) =>{
    let array = []
    let index = 0

    const myModal = new bootstrap.Modal(document.getElementById('saveDeleteMap'));
    const myModalTitle = new bootstrap.Modal(document.getElementById('saveDeleteMapTitle'));

    myModalTitle._element.innerText = "Deseja guardar o mapa criado?"

    myModal.toggle();
    myModal.show();

    const elemento = document.getElementById('discardBtn');
    elemento.setAttribute('hidden', 'true');

    ConfirmSaveDeleteBtn.removeAttribute('hidden');

    ConfirmSaveDeleteBtn.onclick = (event) =>{
        console.log("hiiii")
        array[index] = {"width": sizeX,"height": sizeY, "numExpos": canvas.getShapes().length, "numLabels": canvas.getTexts().length};
        index ++;
        
        canvas.getShapes().forEach(element => {
            array[index] = {"id": element.id, "posX": element.posX, "posY": element.posY, "width": element.width,
                            "height": element.height, "products": element.products,"capacity": element.capacity, 
                            "divisions": element.divisions, "storeSection": element.storeSection};
            index ++;
        });

        canvas.getTexts().forEach(element => {
            array[index] = {"id": element.id, "posX": element.posX, "posY": element.posY, "width": element.width,
                            "height": element.height, "angle": element.angle, "value": element.text};
            index ++;
        });


        let json = JSON.stringify(array)

        mapFormField.value = json

        console.log(mapFormField);
        
        // Envie o formulário
        
        document.getElementById("formulario").submit()
    }
}

discardAlteration.onmousedown = (event) =>{
    const myModal = new bootstrap.Modal(document.getElementById('saveDeleteMap'));
    const myModalTitle = new bootstrap.Modal(document.getElementById('saveDeleteMapTitle'));

    myModalTitle._element.innerText = "Deseja descartar o mapa criado?"

    myModal.toggle();
    myModal.show();

    const elemento = document.getElementById('discardBtn');
    elemento.removeAttribute('hidden');

    ConfirmSaveDeleteBtn.setAttribute('hidden', 'true');
}



//https://stackoverflow.com/questions/22785521/how-can-i-drag-a-piece-of-user-generated-text-around-the-html5-canvas

