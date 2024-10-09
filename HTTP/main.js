/*
 * Ficheiro onde reside a função main.
 */

// Elementos de UI:
const actor_label       = document.getElementById('actor_label')
const share_label       = document.getElementById('share_label')
const node_path         = document.getElementById('node_path')
const time_select       = document.getElementById('time_select')
const toogle_refresh    = document.getElementById('toogle_refresh')
const refresh_status    = document.getElementById('refresh_status')

const results_div       = document.getElementById('results_div')
const results_title     = document.getElementById('results_title')

// Snippets de elementos de UI:
const activity_semafore = [
    [],
]

const spiner            = "<div id='toogle_refresh_spinner' class='spinner-border' role='status'></div>"
const activity_1min     = ""
const activity_10min    = ""
const activity_1hour    = ""
const activity_1day     = ""
const activity_1week    = ""
const activity_more     = ""
const activity_unlink   = ""
const activity_rename   = ""
const activity_mkdir    = ""

// Constantes globais:
/**
 * O número máximo de eventos listados.
 * Serve para evitar que o browser crashe ou fique sem memória.
 */
const max_events = 100

// Variaveis globais:
/**
 * Variável que guarda o thread pointer do refresh thread.
 */
var refresh_thread

/**
 * Variável que indica ao thread refresh (refresh_thread) para pausar.
 */
var is_paused = false

/**
 * Esta variável acabou por ficar legacy, porque o thread foi desenvolvido
 * desta maneira.
 * Embora pareça redundante, porque já existe a variável is_paused,
 * esta variável faz toda a diferença na prevenção de threads duplicados
 * (Caso o utilizador clique muito rápido no botão toggle_pause, por exemplo)
 */
var refresh_in_progress = false

var refreshing_once     = false

/**
 * De quanto em quanto tempo esta página pede atualizações ao servidor.
 * refresh_thread
 * (Em milisegundos)
 */
var delay = 5000

/**
 * Guarda filtros e pesquisas de anteriores sessões.
 */
const state = {
    actor_label         : "",
    share_label         : "",
    node_path           : "",
    time_select         : "1m",// Este valor não fica na primeira execussão, tem de se colocar em simultâneo com a opção selected correspondente.
    is_paused           : is_paused,// Sim ,sim. Talvez depois melhore isto. (Variáveis redundantes e tal...)
}

/**
 * Função main
 */
function main() {

    // Reload dos settings da sessão anterior:
    reload = JSON.parse(window.localStorage.getItem("state"))
    if(reload != null) {
        state.actor_label       = reload.actor_label
        actor_label.value       = state.actor_label
        state.share_label       = reload.share_label
        share_label.value       = state.share_label
        state.node_path         = reload.node_path
        node_path.value         = state.node_path
        state.time_select       = reload.time_select
        time_select.value       = state.time_select
        state.is_paused         = reload.is_paused
        is_paused               = state.is_paused
    }
    else {
        window.localStorage.setItem("state", JSON.stringify(state))
    }

    // Iniciar o thread refresh + botão de pausar / retomar para ter a mensagem correta
    if(!is_paused) {
        toogle_refresh.innerHTML = "⏸️ Pausar"
        refresh_status.innerHTML = "🔴 Ao vivo:"
        if(!refresh_in_progress){
            //refresh_in_progress = true
            //refresh_thread = setInterval(refresh, delay)
            refresh()
        }
        is_paused = false // Redundante, mas mesmo assim, fica aqui
    }
    else {
        toogle_refresh.innerHTML = "▶️ Retomar"
        refresh_status.innerHTML = "⚠️ Pausado!"
    }

    if(is_paused) {
        refreshing_once = true
        setInterval(refresh_once, 2000)
    }
}

/**
 * Função para pausar / retomar o thread refresh
 */
function toogle_refresh_thread() {
    
    is_paused = !is_paused
    state.is_paused = is_paused
    // O servidor nunca chega a receber state.is_paused = true
    // O que interessa é que fique registado no LocalStorage, por isso update_state(), a seguir.
    update_state()
    if(!is_paused) {
        toogle_refresh.innerHTML = "⏸️ Pausar"
        refresh_status.innerHTML = "🔴 Ao vivo:"
        if(!refresh_in_progress){
            //refresh_in_progress = true
            //refresh_thread = setInterval(refresh, delay)
            refresh()
        }
        is_paused = false // Redundante, mas mesmo assim, fica aqui
    }
    else {
        toogle_refresh.innerHTML = "▶️ Retomar"
        refresh_status.innerHTML = "⚠️ Pausado!"
    }
}

/**
 * Função refresh
 * 
 */
function refresh(once = false) {
    // *
    // Antes de começar a execussão, saber se foi mandado parar:
    if(is_paused && !once) {
        refresh_in_progress = false
        clearInterval(refresh_thread)
        return
    }

    //const data = { username: "example" };
    fetch("/ajax.html",
        {
            method: "POST", // ou "PUT"
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(state),
        }
    ).then(
        response => response.json()
    ).then(
        data => {
            display_results(data)
        }
    ).catch(
        (error) => {
            console.error("Error:", error)
        }
    )

    // *
    // Só é executado na primeira execussão e inicia o thread:
    if(!refresh_in_progress && !once) {
        refresh_in_progress = true
        refresh_thread = setInterval(refresh, delay)
    }
}

/**
 * Função que é chamada sempre que se edita os filtros.
 */
function update_state() {
    state.actor_label       = actor_label .value
    state.share_label       = share_label.value
    state.node_path         = node_path.value
    state.time_select       = time_select.value
    window.localStorage.setItem("state", JSON.stringify(state))

    // Caso esteja pausado, faz refresh apenas uma vez:
    if(is_paused) {
        refreshing_once = true
        setInterval(refresh_once, 2000)
    }
}

/**
 * Como o nome indica.
 */
function clear_filters(){
    actor_label.value       = ""
    share_label.value       = ""
    node_path.value         = ""
    //time_select.value       = "1m"

    update_state()
}

function refresh_once(){
    if(refreshing_once){
        refreshing_once = false
        refresh(once = true)
    }
}

function display_results(data) {

    //console.log("Success:", data)
    
    if(data.length > 200){
        results_title.innerHTML = "Existem mais de 200 resultados; A mostrar 200 resultados:"
    }
    else if(data.length < 1){
        results_title.innerHTML = "Sem resultados para mostrar."
    }
    else{
        results_title.innerHTML = `A mostrar ${data.length} resultados:`
    }
    result_string = ""
    for (const result of data) {

        datetime = timeConverter(result["timestamp"])

        if(result["event_type"] == 2){
            if(result["node1_name"] == result["node2_name"]){
                result_string += `
                <div class="rounded border border-warning-subtlee" style="background-color: #440; border: #fff;margin: 3px; padding: 6px;">
                    🗓️${datetime} 👨🏼‍💻${result["actor_label"]} 💿${result["share_label"]}<br>
                    ⤵️Move: <span class="mono">${result["node1_name"]}</span><br>
                    <hr style="margin: 0px; padding: 0px;">
                    <span class="mono">${result["node1_path"]}<br>⬇️<br>
                    ${result["node2_path"]}</span>
                </div>`
            } else {
                result_string += `
                <div class="rounded border border-primary-subtle" style="background-color: #024; border: #fff;margin: 3px; padding: 6px;">
                    🗓️${datetime} 👨🏼‍💻${result["actor_label"]} 💿${result["share_label"]}<br>
                    📝Rename: <span class="mono">${result["node1_name"]}</span> ➡️ <span class="mono">${result["node2_name"]}</span><br>
                    <hr style="margin: 0px; padding: 0px;">
                    <span class="mono">${result["node2_path"]}</span>
                </div>`
            }
        }
        else if(result["event_type"] == 1){
            result_string += `
            <div class="rounded border border-success-subtle" style="background-color: #240; border: #fff;margin: 3px; padding: 6px;">
                🗓️${datetime} 👨🏼‍💻${result["actor_label"]} 💿${result["share_label"]}<br>
                📁Mkdir: <span class="mono">${result["node1_name"]}</span><br>
                <hr style="margin: 0px; padding: 0px;">
                <span class="mono">${result["node1_path"]}</span>
            </div>`
        }
        else{
            result_string += `
            <div class="rounded border border-secondary-subtle" style="background-color: #420; border: #fff;margin: 3px; padding: 6px;">
                🗓️${datetime} 👨🏼‍💻${result["actor_label"]} 💿${result["share_label"]}<br>
                ❌Unlink: <span class="mono">${result["node1_name"]}</span><br>
                <hr style="margin: 0px; padding: 0px;">
                <span class="mono">${result["node1_path"]}</span>
            </div>`
        }
    }
    results_div.innerHTML = result_string
}

function timeConverter(UNIX_timestamp){
    var a = new Date(UNIX_timestamp * 1000);
    var months = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = date + ' ' + month + ' ' + year + ' ⌚' + hour + ':' + min + ':' + sec ;
    return time;
}
