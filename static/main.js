import * as THREE from 'three'
import { CameraControls } from './cameraControls.js'
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff)
const fieldOfView = 75;
//const camera = new THREE.PerspectiveCamera(fieldOfView, window.innerWidth / window.innerHeight, 0.1, 1000);
const camera = new THREE.OrthographicCamera(window.innerHeight / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, 1, 1000);

const viewPortScalar = Math.tan(fieldOfView/2);

const renderer = new CSS3DRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new CameraControls(camera, renderer.domElement);
controls.enableDamping = false;

camera.position.y = 0;
camera.position.x = 0;
camera.position.z = 350;

camera.rotation.x = 0;
camera.rotation.y = 0;
camera.rotation.z = 0;

const group = new THREE.Group();
scene.add(group);


const coords_text = document.getElementById("coords_text");
coords_text.style.userSelect = "none";

var currentActiveElem = "";

var left_click = 0;

var dragStarted = false;
var dragStartX;
var dragStartY;

var save_map = new Map();
window.save_map = save_map;

document.addEventListener('mousedown', function(event) {
    if(event.button == 0) {
        left_click = 1;
    }
    //console.log(event.target);
});
document.addEventListener('mouseup', function(event) {
    if(event.button == 0) {
        left_click = 0;
        dragStarted = false;
        if(document.activeElement.id != currentActiveElem && currentActiveElem != "") {
            document.getElementById(currentActiveElem).setAttribute("isDraggable", "false");
            document.getElementById(currentActiveElem).style.backgroundColor = "#ffffff00";
            document.getElementById(currentActiveElem).style.border = "none";
        }
        //console.log(document.activeElement)
        //console.log(event.clientX, event.clientY);
    }
});

document.addEventListener('dblclick', function(event) {
    console.log(document.activeElement);
    if(document.activeElement.id.includes("mathField") || document.activeElement.id.includes("graphElement") || document.activeElement.id.includes("imageElement")) {
        document.activeElement.setAttribute("isDraggable", "true");
        document.activeElement.style.backgroundColor = "#007bff47";
        currentActiveElem = document.activeElement.id;
        if (currentActiveElem.includes("image")) {
            document.activeElement.style.border = "2px solid black";
        }
        console.log("set active");
    }
    //console.log(document.activeElement)
});

document.addEventListener('mousemove', function(event) {
    if(document.activeElement.getAttribute("isDraggable") == "true") {
        if(left_click == 1) {
            group.children.forEach(object => {
                let id_string = object.element.id.split('_')[1];
                if(id_string == currentActiveElem.split('_')[1]) {
                    object.position.x += event.movementX / camera.zoom;
                    object.position.y -= event.movementY / camera.zoom;
                    let temp_value = save_map.get(id_string);
                    temp_value[0] = object.position.x;
                    temp_value[1] = object.position.y;
                    save_map.set(id_string, temp_value);
                }
            });
        }
    }
});

document.addEventListener('keydown', function(event) {
    if(event.altKey && event.ctrlKey) {
        if(event.code === "KeyP") {
            
        } else if(event.code === "KeyA") {
            group.add(new MathElement(0, 0, null, null));
        } else if(event.code ==="KeyX") {
            if(document.activeElement.getAttribute("isDraggable") == "true") {
                let id_string = document.activeElement.id.split("_")[1];
                for (const [key, value] of save_map) {
                    if (key.includes(id_string)) {
                        save_map.delete(key);
                    }
                }
                document.activeElement.remove();
            }
        } else if(event.code === "KeyS") {
            group.add(new GraphElement(0, 0));
        }
    } else if(event.ctrlKey && !event.altKey) {
        if(event.code == "KeyS") {
            event.preventDefault();
            save();
        } else if(event.code == "KeyO") {
            event.preventDefault();
            load();
        }
    } else if(event.code === "ArrowDown") {
        if (document.activeElement.id.includes("image")) {
            let width = document.get
        }
    }
    //console.log(event);
});

document.onpaste = function (event) {
    var items = (event.clipboardData || event.originalEvent.clipboardData).items;
    console.log(JSON.stringify(items));
    var blob = null;
    for (var i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") === 0) {
            blob = items[i].getAsFile();
        }
    }
    if (blob !== null) {
        var reader = new FileReader();
        reader.onload = function(event) {
            console.log(event.target.result);
            // document.getElementById("pastedImage").src = event.target.result;
            group.add(new imgElement(0, 0, event.target.result, null));
        };
        reader.readAsDataURL(blob);
    }
}

function MathElement(x, y, idString, data) {
    const div = document.createElement('div');

    console.log("creating");

    div.style.backgroundColor = '#00000000'

    const mathField = document.createElement('math-field');
    mathField.addEventListener("input", (ev) => {
        if (mathField.value != "") {
            mathField.style.border = "none";
        } else {
            mathField.style.border = "";
        }

    });

    div.appendChild(mathField);
    
    // div.appendChild(mathFieldSpan)

    if (!idString) {
        idString = new Date().getTime().toString()
    }
    if (data) {
        mathField.value = data;
        mathField.style.border = "none";
    }


    div.id = `mathContainer_${idString}`;
    mathField.id = `mathField_${idString}`;
    mathField.setAttribute("isDraggable", "false");

    save_map.set(`mathContainer_${idString}`, div);
    save_map.set(idString, [0, 0, null]); //x, y, value

    const object = new CSS3DObject(div);
    object.position.set(x, y, 0);

    return object;
}

function GraphElement(x, y) {
    const div = document.createElement('div');

    div.style.backgroundColor = '#00000000'
    const graphElement = document.createElement('iframe');
    graphElement.style.width = '500px';
    graphElement.style.height = '300px';
    graphElement.src = "https://www.geogebra.org/calculator";
    div.appendChild(graphElement);

    var idString = new Date().getTime().toString()
    div.id = `graphContainer_${idString}`;
    graphElement.id = `graphElement_${idString}`;
    graphElement.setAttribute("isDraggable", "false");

    // graphElement.width  = graphElement.contentWindow.document.body.scrollWidth;
    // graphElement.height = graphElement.contentWindow.document.body.scrollHeight;

    const object = new CSS3DObject(div);
    object.position.set(x, y, 0);

    return object;
}

function imgElement(x, y, data, idString) {
    const div = document.createElement('div');
    div.style.backgroundColor = "#00000000";
    const image = document.createElement('img');
    image.src = data;
    div.appendChild(image);
    
    if (!idString) {
        idString = new Date().getTime().toString()
    }


    div.id = `imageContainer_${idString}`;
    image.id = `imageElement_${idString}`;
    image.setAttribute("draggable", "false");
    image.setAttribute("tabindex", "0");

    image.addEventListener('dblclick', function(event) {
        const doubleClickedElement = event.target;
        console.log('Double-clicked element:', doubleClickedElement);
        // Additional actions can be performed with the doubleClickedElement
      });

    save_map.set(`imageContainer_${idString}`, div);
    save_map.set(idString, [0, 0, null]);

    const object = new CSS3DObject(div);

    return object;

}
function save() {
    console.log("save");
    //console.log(scene);

    for (const [key, value] of save_map) {
        if (key.includes("mathContainer")) {
            let id_string = key.split("_")[1];
            let temp_value = save_map.get(id_string);
            temp_value[2] = value.children[0].value;
            save_map.set(id_string, temp_value);
        } else if (key.includes("imageContainer")) {
            let id_string = key.split("_")[1];
            let temp_value = save_map.get(id_string);
            temp_value[2] = value.children[0].src;
            save_map.set(id_string, temp_value);
        }
        
    }


    async function exportMapToFile() {

        const save_map_array = Array.from(save_map);
        const jsonString = JSON.stringify(save_map_array);

        try {
            const handle = await window.showSaveFilePicker({
                suggestedNAme: 'output.json',
                types: [{ description: 'JSON Files', accept: { 'application/json': ['.json'] } }]
            });
            const writableStream = await handle.createWritable();
            await writableStream.write(jsonString);
            await writableStream.close();
        } catch (error) {
            console.error('Error saving file:', error);
        }

    }

    exportMapToFile();
}

function load() {
    var importedMap;
    async function importMapFromFile() {
        try {
            const handle = await window.showOpenFilePicker({
                types: [{ description: 'JSON Files', accept: { 'application/json': ['.json'] } }]
            });
            console.log(handle);
            const file = await handle[0].getFile();
            const fileContent = await file.text();
            const mapArray = JSON.parse(fileContent);
            importedMap = new Map(mapArray);
            console.log(importedMap);

            for (const [key, value] of save_map) {
                save_map.delete(key);
            }

            for (const [key, value] of importedMap) { 
                save_map.set(key, value);
            }

            // for (const [key, value] of save_map) {
            //     if(key.includes("mathContainer")) {
            //         let id_string = key.split("_")[1];
            //         let field_value = save_map.get(id_string);
            //         MathElement(value[0], value[1], id_string, field_value);
            //         //document.getElementById(key).value.children[0].value = field_value[2];
            //         //console.log(document.getElementById(key));
            //     }
            // }

            populate();

        } catch (error) {
            console.error('Error importing file:', error);
        }
    }

    importMapFromFile();
    console.log(save_map);
}

function populate() {
    for (const [key, value] of save_map) {
        if (key.includes("mathContainer")) {
            let id_string = key.split("_")[1];
            let data = save_map.get(id_string);
            //console.log(id_string, data);
            group.add(new MathElement(data[0], data[1], id_string, data[2]));
        } else if (key.includes("imageContainer")) {
            let id_string = key.split("_")[1];
            let data = save_map.get(id_string);
            group.add(new imgElement(data[0], data[1], id_string, data[2]));
        }
    }
}

function animate() {
    requestAnimationFrame(animate);

    controls.update();
    // WebGLControls.update();

    camera.rotation.x = 0;
    camera.rotation.y = 0;
    camera.rotation.z = 0;

    renderer.render(scene, camera);

    coords_text.innerText = `(${Math.round(camera.position.x)}, ${Math.round(camera.position.y)}, ${Math.round(camera.position.z)})`;
}
animate();
