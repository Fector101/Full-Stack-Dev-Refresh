exports.getDate = function (){
    const today = new Date()
    const opts = {weekday:'long',day:"numeric",month:"long"}
    return today.toLocaleDateString("en-US",opts)
}

exports.getDay = function(){
    const today = new Date()
    const opts = {weekday:'long'}
    return  today.toLocaleDateString("en-US",opts)
}
