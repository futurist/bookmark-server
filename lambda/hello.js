module.exports.run = function(event, context, cb) {
  setTimeout(()=>{
    cb(null, {
      body: event
    })
  }, 1000)
}
