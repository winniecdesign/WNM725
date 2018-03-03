process.env.MONGODB_URI = 'mongodb://';
var mongoose = require('mongoose');
var schema = mongoose.Schema({
    key: {type: String, require: true},
    value: {type: String, required: true},
    created: {type: Date, default: Date.now }
});
var Monitor = mongoose.model('Monitor', schema);
var Boom = require('boom');

require('mahrio').runServer( process.env, __dirname)
    .then( function(server){
        server.route({
            path: '/monitor',
            method: 'GET',
            handler: function(request, reply) {
                Monitor.find().exec( function(err, monitored){
                    if( err || !monitored ) { return reply( Boom.badRequest('Unable to Save')); }

                    reply(monitored);
                });
            }
        });
        server.route({
            path: '/monitor/{type}',
            method: 'POST',
            handler: function(request, reply) {
                switch(request.params.type){
                    // ADD MORE KEYS
                    case 'temp':
                    case 'motion':
                    case 'moisture':
                        if( !request.payload.value ) { return reply( Boom.badRequest('Missing Value')); }
                        Monitor.create({
                            key: request.params.type,
                            value: request.payload.value
                        }, function(err, monitor){
                            if( err || !monitor ) { return reply( Boom.badRequest('Unable to Save')); }

                            reply( monitor );
                        });
                        break;
                    default:
                        reply( Boom.badRequest('Unsupported Type'));
                }
            }
        });

        server.route({
            path: '/monitor/{id}',
            method: 'DELETE',
            handler: function( request, reply){
                Monitor.remove({_id: request.params.id}).exec( function(err, monitor) {
                    if( err ) { return rep( Boom.badRequest(err) ); }

                    if( monitor && monitor.result && monitor.result.ok ) {
                        reply({deleted: true});
                    } else {
                        reply({deleted: false});
                    }
                });
            }
        })
    }); // Server runs http://127.0.0.1:6085