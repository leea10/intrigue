const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name : String,
    email : { type : String, unique : true, required : true },
    password : {type : String, required : true },
    stories : [mongoose.Schema.Types.ObjectId]
});

//Bofore the user is removed, delete all their stories
UserSchema.pre("remove", function(next){
    for(let i = 0; i < this.characters.length; i++){
        Story.remove({_id : this.stories[i]}).exec();
    }
    next();
});

const User = mongoose.model("User", UserSchema);

const StorySchema = new mongoose.Schema({
    author :  {type : mongoose.Schema.Types.ObjectId, required : true},
    title : {type : String, required : true},
    description : String,
    image : String,
    characters : [mongoose.Schema.Types.ObjectId],
    snapshots : [mongoose.Schema.Types.ObjectId],
    tags : [mongoose.Schema.Types.ObjectId]
});

//Before the story is removed, delete all of its characters, snapshots, and tags
//Then remove the reference to this story from the user object
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
    User.findByIdAndUpdate(this.author, {$pull: {"stories": this._id}}).exec();
    next();
});

//After the story is saved the first time add a reference to it to the author's user object
StorySchema.post("save", function(doc, next){
    User.findByIdAndUpdate(doc.author, {$push : {"stories" : doc._id}}).exec();
    next();
});

const Story = mongoose.model("Story", StorySchema);

const CharacterSchema = new mongoose.Schema({
    story : {type : mongoose.Schema.Types.ObjectId, required : true},
    name : String,
    age : Number,
    description : String,
    history : String,
    personality : String,
    tags : [mongoose.Schema.Types.ObjectId]
});

//Before a character is removed, delete it's relationships
CharacterSchema.pre("remove", function(next){
    Relationship.remove({characters : this._id}).exec();
    next();
});

//After a character is saved the first time, add a reference to it to the story object
CharacterSchema.post("save", function(doc, next){
    Story.findByIdAndUpdate(doc.story, {$push : {"characters" : doc._id}}).exec();
    next();
});

const Character = mongoose.model("Character", CharacterSchema);

const SnapshotSchema = new mongoose.Schema({
    story : {type : mongoose.Schema.Types.ObjectId, required : true},
    label : String,
    nodes : [mongoose.Schema.Types.ObjectId],
    relationships : [mongoose.Schema.Types.ObjectId]
});

//Before a snapshot is removed, delete it's nodes, relationships, and update it's story reference
SnapshotSchema.pre("remove", function(next){
    for(let i = 0; i < this.nodes.length; i++){
        Node.remove({_id : this.nodes[i]}).exec();
    }
    for(let i = 0; i < this.relationships.length; i++){
        Relationship.remove({_id : this.relationships[i]}).exec();
    }
    Story.findByIdAndUpdate(this.story, {$pull : {"snapshots" : this._id}}).exec();
    next();
});

//After a snapshot is saved the first time, add a reference to it to the story object
SnapshotSchema.post("save", function(doc, next){
    Story.findByIdAndUpdate(doc.story, {$push : {"snapshots" : doc._id}}).exec();
    next();
});

const Snapshot = mongoose.model("Snapshot", SnapshotSchema);

const RelationshipSchema = new mongoose.Schema({
    snapshot : {type : mongoose.Schema.Types.ObjectId, required : true},
    characters : [mongoose.Schema.ObjectId],
    nodes : [mongoose.Schema.Types.ObjectId],
    description : String,
    tags : [mongoose.Schema.Types.ObjectId]
});

//
RelationshipSchema.pre("remove", function(next){
    Snapshot.findByIdAndUpdate(this.snapshot, {$pull : {"relationships" : this._id}}).exec();
});

RelationshipSchema.post("save", function(doc, next){
    Snapshot.findByIdAndUpdate(doc.snapshot, {$push : {"relationships" : doc._id}}).exec();
    next();
});

const Relationship = mongoose.model("Relationship", RelationshipSchema);

const TagSchema = new mongoose.Schema({
    parent : {type : mongoose.Schema.Types.ObjectId, required : true},
    name : {type : String, required : true}
});

TagSchema.post("save", function(doc, next){
    Story.findByIdAndUpdate(doc.parent, {$push : {"tags" : doc._id}}).exec();
    next();
});

const Tag = mongoose.model("Tag", TagSchema);

const NodeSchema = new mongoose.Schema({
    snapshot : {type : mongoose.Schema.Types.ObjectId, required : true},
    character : {type : mongoose.Schema.Types.ObjectId, required : true},
    x : {type : Number, required : true},
    y : {type : Number, required : true}
});

NodeSchema.pre("remove", function(next){
    Snapshot.findByIdAndUpdate(this.snapshot, {$pull : {"nodes" : this._id}}).exec();
});

NodeSchema.post("save", function(doc, next){
    Snapshot.findByIdAndUpdate(doc.snapshot, {$push : {"nodes" : doc._id}}).exec();
    next();
});

const Node = mongoose.model("Node", NodeSchema);

module.exports = {
    User : User,
    Story : Story,
    Character : Character,
    Snapshot : Snapshot,
    Relationship : Relationship,
    Tag : Tag,
    Node : Node
};
