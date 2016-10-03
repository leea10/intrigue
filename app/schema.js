var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    name : String,
    email : { type : String, unique : true, required : true },
    password : {type : String, required : true },
    stories : [mongoose.Schema.Types.ObjectId]
});

var User = mongoose.model("User", UserSchema);

var StorySchema = new mongoose.Schema({
    title : String,
    description : String,
    image : String,
    characters : [mongoose.Schema.Types.ObjectId],
    snapshots : [mongoose.Schema.Types.ObjectId],
    tags : [mongoose.Schema.Types.ObjectId]
});

StorySchema.pre("remove", function(next){
    for(let i = 0; i < this.characters.length; i++){
        Character.remove({_id : this.characters[i]}).exec();
    }
    for(let i = 0; i < this.snapshots.length; i++){
        Snapshot.remove({_id : this.snapshots[i]}).exec();
    }
    for(let i = 0; i < this.tags.length; i++){
        Tag.remove({_id : this.tags[i]}).exec();
    }
    next();
});

var Story = mongoose.model("Story", StorySchema);

var CharacterSchema = new mongoose.Schema({
    name : String,
    age : Number,
    description : String,
    history : String,
    personality : String,
    tags : [mongoose.Schema.Types.ObjectId]
});

CharacterSchema.pre("remove", function(next){
    Relationship.remove({characters : this._id}).exec();
    next();
});

var Character = mongoose.model("Character", CharacterSchema);

var SnapshotSchema = new mongoose.Schema({
    label : String,
    nodes : [mongoose.Schema.Types.ObjectId],
    relationships : [mongoose.Schema.Types.ObjectId]
});

SnapshotSchema.pre("remove", function(next){
    for(let i = 0; i < this.nodes.length; i++){
        Node.remove({_id : this.nodes[i]}).exec();
    }
    for(let i = 0; i < this.relationships.length; i++){
        Relationship.remove({_id : this.relationships[i]}).exec();
    }
    next();
});

var Snapshot = mongoose.model("Snapshot", SnapshotSchema);

var RelationshipSchema = new mongoose.Schema({
    characters : [mongoose.Schema.ObjectId],
    nodes : [mongoose.Schema.Types.ObjectId],
    description : String,
    tags : [mongoose.Schema.Types.ObjectId]
});

var Relationship = mongoose.model("Relationship", RelationshipSchema);

var TagSchema = new mongoose.Schema({
    name : {type : String, required : true}
});

var Tag = mongoose.model("Tag", TagSchema);

var NodeSchema = new mongoose.Schema({
    character : {type : mongoose.Schema.Types.ObjectId, required : true},
    x : {type : Number, required : true},
    y : {type : Number, required : true}
});

var Node = mongoose.model("Node", NodeSchema);

module.exports = {
    User : User,
    Story : Story,
    Character : Character,
    Snapshot : Snapshot,
    Relationship : Relationship,
    Tag : Tag,
    Node : Node
};
