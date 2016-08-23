module.exports = function(req, res, next) {
  if(req.method === 'PUT'){
      return next();
  }
  return res.json({error:'Invalid request type, path does not support ' + req.method});
};