var mongoose = require('mongoose');
var Schema = mongoose.Schema;


mongoose.Promise = global.Promise;
mongoose
    .connect(process.env.DB, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    })
    .then(() => console.log('Movies DB Connected!'))
    .catch(err => {
        console.log("Movies DB Connection Error" + err.message);
    });

mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);


var ActorSchema = new Schema({
    actorName: {type: String, required: true},
    characterName: {type: String, required: true}
});


var MovieSchema = new Schema({
    title: { type: String, required: true},
    yearReleased: { type: Date, required: true},
    genere: { type: String, enum: ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Thriller', 'Western']},
    actors: { type: [ActorSchema], required: true },
    
});

// return the model
module.exports = mongoose.model('Movie', MovieSchema);