var EventEmitter = require("events").EventEmitter;
var EventWrapper = require("event-wrapper");
var dispatcher = new EventEmitter;
var clientsWatching = {};
var watching = false;
var softDebugInterval = 30000;
var hardDebugInterval = 300000;
var prohibidenSoftStates = ["REGEN","FIGHTING","DISCONNECTED"];
exports = module.exports = dispatcher;
exports.startWatching = function(softInterval , hardInterval){
    if(typeof interval != "undefined"){
        watchingInterval = interval;
    }
    watching  = setInterval(watch,softDebugInterval);
}
exports.stopWatching = function(){
    clearInterval(watching);
}
exports.bind = function(bot){
    var wrap = EventWrapper(bot.connection.dispatcher,function(error){
        if(typeof error == "undefined"){
            console.log("Activity inspection for "+bot.data.accompt.username +" done !");
        }
        else{
            dispatcher.emit("botDown",bot);
        }
        clientsWatching[bot.data.accompt.username].last = -1;
    });
    var newWatch = {bot: bot, last: new Date().getTime(), wrap: wrap};
    clientsWatching[bot.data.clientId,bot.data.accompt.username] = newWatch;
    wrap("GameMapMovementMessage",function(m){
        if(m.actorId == newWatch.bot.data.characterInfos.id){
            newWatch.last=new Date().getTime();
        }
    });
    wrap("LoginQueueStatusMessage",
         "QueueStatusMessage",
         "GameFightTurnEndMessage",
         "GameFightTurnStartMessage",function(m){
        newWatch.last = new Date().getTime();
    });//todo plus de presision sur les activités par example l´elvage ou le flood et detecter la deconnection ^^ (pour eviter le dellay <3)
}
function getClientIndicator(id,groupe){
    return groupe+":"+id;
}
function watch(){//Todo gérer correctement le hardDebug apres avoir géré correctement la reconnexion 
    var current = new Date().getTime();
    for(var i in clientsWatching){
        var w = clientsWatching[i];
        if(w.last + softDebugInterval < current  && !prohibidenSoftStates.includes(w.bot.data.state) && w.last != -1){//On évite la reco pour debug .
                console.log("[INACTIVITY] Soft debug on "+w.bot.data.accompt.username+" .");
                w.bot.sync.process();
        }
        else if(w.last!=-1){
            w.last=new Date().getTime();
        }
    }
}
