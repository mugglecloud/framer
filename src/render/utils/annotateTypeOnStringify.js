// When applied to a type, JSON.stringify will append a "__type__" field to the outputted JSON string. This
// can be used to re-instatiate an object of the correct type when deserializing the JSON.
export function annotateTypeOnStringify(ctor, typeName) {
    const existingToJSON = ctor.prototype.toJSON;
    ctor.prototype.toJSON = function () {
        const base = existingToJSON ? existingToJSON.apply(this) : this;
        return Object.assign({}, base, { __type__: typeName });
    };
    return ctor; // moot; but seems like the sensical thing to do.
}
export function isOfAnnotatedType(object, typeName) {
    return object && object.__type__ && object.__type__ === typeName;
}
