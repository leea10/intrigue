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
    Snapshots : [mongoose.Schema.Types.ObjectId]
});

var Story = mongoose.model("Story", StorySchema);

var CharacterSchema = new mongoose.Schema({
    name : String,
    age : Number,
    description : String,
    history : String,
    personality : String,
    Tags : [mongoose.Schema.Types.ObjectId]
});

var Character = new mongoose.model("Character", CharacterSchema);

var SnapshotSchema = new mongoose.Schema({
    label : String,
    nodes : [mongoose.Schema.Types.ObjectId],
    relationships : [mongoose.Schema.Types.ObjectId]
});

var Snapshot = new mongoose.model("Snapshot", SnapshotSchema);

var RelationshipSchema = new mongoose.Schema({
    nodes : [mongoose.Schema.Types.ObjectId],
    description : String,
    tags : [mongoose.Schema.Types.ObjectId]
});

var Relationship = new mongoose.model("Relationship", RelationshipSchema);

var TagSchema = new mongoose.Schema({
    name : {type : String, required : true}
});

var Tag = new mongoose.model("Tag", TagSchema);

var NodeSchema = new mongoose.Schema({
    character : {type : mongoose.Schema.Types.ObjectId, required : true},
    x : {type : Number, required : true},
    y : {type : Number, required : true}
});

var Node = new mongoose.model("Node", NodeSchema);

module.exports = {
    User : User,
    Story : Story,
    Character : Character,
    Snapshot : Snapshot,
    Relationship : Relationship,
    Tag : Tag,
    Node : Node
};
