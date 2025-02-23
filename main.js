// Importar todos os componentes do modulo Three e outros componentes de modulos complementares
import * as THREE from 'three'; // importar todos sob o nome THREE
import Stats from 'three/addons/libs/stats.module.js' // importar default 
import { OrbitControls } from 'three/addons/controls/OrbitControls.js' // importar componente especifica
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

let raycaster = new THREE.Raycaster()
let carregador = new GLTFLoader()
let rato = new THREE.Vector2()
let meuCanvas = document.getElementById('myCanvas');
let Largura_Canvas = 800;
let Altura_Canvas = 600;
let gltf_var // Conteudo do ficheiro gltf 
let acao_aux = []

const cor_Amarelo = new THREE.Color('yellow');
// criar uma cena... 
let cena = new THREE.Scene();
let misturador = new THREE.AnimationMixer(cena);
// preparar um renderer WebGL e adicioná-lo à pagina com a resolução do exercício
let renderer = new THREE.WebGLRenderer()
renderer.setSize(Largura_Canvas, Altura_Canvas)
meuCanvas.appendChild(renderer.domElement);

//carregar os eixos na cena
let eixos = new THREE.AxesHelper()
cena.add(eixos)

// criar uma camara... 
let camara = new THREE.PerspectiveCamera(70, Largura_Canvas / Altura_Canvas, 0.01, 100);
camara.position.x = 1
camara.position.y = 1
camara.position.z = 2
camara.lookAt(0, 0, 0)

// adicionar a grelha
let grelha = new THREE.GridHelper()
cena.add(grelha)

const LuzPonto = new THREE.PointLight("white");
LuzPonto.position.set(0, 4, 2); //aponta na direção de (0, 0, 0)
LuzPonto.intensity = 100
LuzPonto.castShadow = true
cena.add(LuzPonto);
// auxiliar visual
const LightHelper2 = new THREE.PointLightHelper(LuzPonto, 0.2)
cena.add(LightHelper2)


// adicionar controlos orbitais
const controls = new OrbitControls(camara, renderer.domElement);

// limitar taxa de atualizacao
let delta = 0;                      // tempo que passou desde a última atualização
let relogio = new THREE.Clock();    // componente auxiliar para obtenção do delta
let latencia_minima = 1 / 60;       // limita a taxa de atualização a 60 atualizações por segundo
// carregar o ficheiro gltf... 
function carregarGLTF(ficheiro) {
    carregador.load(
        ficheiro,
        function (gltf) {
            cena.add(gltf.scene)
            var k
            var modelo = gltf.scene
            var animacoes = gltf.animations
            modelo.children.forEach(function (filho, indice) {
                if (animacoes[indice]) {
                    for (k = 0; k < modelo.children.length; k++) {
                        if (animacoes[indice].tracks.length > 0 && animacoes[indice].tracks[0].name.includes(modelo.children[k].name + ".position")) {
                            modelo.children[k].userData.animationClip = animacoes[indice];
                        }
                    }
                }
            });
            gltf_var = gltf
        }
    )
}

carregarGLTF('gltf/proj2portas.gltf');

function carregarInterface(ficheiro) {
    misturador = new THREE.AnimationMixer(cena)
    acao_aux = []
    cena.clear()
    cena.add(eixos)
    cena.add(grelha)
    cena.add(LuzPonto);
    cena.add(LightHelper2)
    carregarGLTF(ficheiro)
}

// loop principal 
function animar() {
    requestAnimationFrame(animar);  // agendar animar para o próximo animation frame
    delta += relogio.getDelta()
    if (delta < latencia_minima)
        return;
    misturador.update(Math.floor(delta / latencia_minima) * latencia_minima)
    renderer.render(cena, camara)
    delta = delta % latencia_minima
}

function animarSelecionado() {
    var i = 0
    var j = 0
    raycaster.setFromCamera(rato, camara);
    let intersetados = raycaster.intersectObjects(cena.children);
    if (intersetados.length > 0) {
        for (i = 0; i < intersetados.length; i++) {
            if (intersetados[i].object.isMesh) {
                break;
            }
        }
        let objetoIntersectado = intersetados[i].object.name;
        for (j = 0; j < gltf_var.scene.children.length; j++) {
            if (gltf_var.scene.children[j].children.length > 0 && objetoIntersectado.includes(gltf_var.scene.children[j].children[0].name)) {
                break;
            }
        }
        objetoIntersectado = gltf_var.scene.children[j]
        if (!(objetoIntersectado === undefined) && !(objetoIntersectado.userData.animationClip === undefined)) {
            var clip = THREE.AnimationClip.findByName(gltf_var.animations, objetoIntersectado.userData.animationClip.name)
            var acao = misturador.clipAction(clip);
            var existenoArray = false
            var m
            for (m = 0; m < acao_aux.length; m++) {
                if (acao_aux[m]._clip.tracks[0].name.includes(acao._clip.tracks[0].name)) {
                    existenoArray = true
                    break;
                }
            }
            if (acao_aux.length == 0 || !(existenoArray)) {
                acao.setLoop(THREE.LoopOnce)
                acao.clampWhenFinished = true;
                acao_aux.push(acao)
                acao.play();

            } else {
                acao_aux[m].paused = false
                acao_aux[m].timeScale = -acao_aux[m].timeScale
                acao_aux[m].play
            }
        }
    }
}

function onclickCanvas(evento) {
    let limites = evento.target.getBoundingClientRect()
    let largura = limites.right - limites.left
    let altura = limites.bottom - limites.top
    //Simula com que o objeto esteja no topo, sendo que a proporção é com base na largura do canvas 
    rato.x = ((evento.clientX - limites.left) / largura) * 2 - 1
    rato.y = -((evento.clientY - limites.top) / altura) * 2 + 1
    animarSelecionado();
}

animar();

meuCanvas.addEventListener('click', onclickCanvas, false);

function toggleButton() {
    var event = this
    if (event.getElementsByClassName("selected").length == 0) {
        var parentElement = event.parentElement;
        var childElements = parentElement.getElementsByClassName('slct');
        if (childElements.length > 0) {
            var grankidsElements = childElements[0].getElementsByClassName('selected');
            if (grankidsElements.length > 0) {
                grankidsElements[0].classList.remove('selected');
            }
            childElements[0].classList.remove('slct');
        }
        event.classList.add('slct');
        event.children[0].classList.add('selected');
        if (event.id.includes("dois")) {
            carregarInterface('gltf/proj2portas.gltf');
        } else if (event.id.includes("cinco")) {
            carregarInterface('gltf/proj5gavetas.gltf');
        }
    }
}

function InterfaceGuide() {
    window.alert("No canto inferior esquerdo da interface 3D encontram-se as opções de cores disponíveis do móvel.\n\nNo canto inferior direito encontram-se as opções de portas/gavetas para o móvel.\n\nPara ver o móvel por dentro basta clickar na porta/gaveta que pretende abrir");
}

var branco = document.getElementById("branco");
var amarelo = document.getElementById("amarelo");
var castanho = document.getElementById("castanho");
var cinza = document.getElementById("cinza");
var preto = document.getElementById("preto");
var dois = document.getElementById("dois");
var cinco = document.getElementById("cinco");
var interface_info = document.getElementById("interface-info");

branco.addEventListener("click", toggleButton)
amarelo.addEventListener("click", toggleButton)
castanho.addEventListener("click", toggleButton)
cinza.addEventListener("click", toggleButton)
preto.addEventListener("click", toggleButton)
dois.addEventListener("click", toggleButton)
cinco.addEventListener("click", toggleButton)
interface_info.addEventListener("click", InterfaceGuide)

window.cena = cena