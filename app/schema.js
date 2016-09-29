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
    snapshots : [mongoose.Schema.Types.ObjectId]
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

var Character = mongoose.model("Character", CharacterSchema);

var SnapshotSchema = new mongoose.Schema({
    label : String,
    nodes : [mongoose.Schema.Types.ObjectId],
    relationships : [mongoose.Schema.Types.ObjectId]
});

var Snapshot = mongoose.model("Snapshot", SnapshotSchema);

var RelationshipSchema = new mongoose.Schema({
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
