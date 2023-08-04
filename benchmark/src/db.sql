
DROP TABLE IF EXISTS CategoryClosure_closure;
DROP TABLE IF EXISTS CategoryClosure;
DROP TABLE IF EXISTS CategoryMaterialized;
DROP TABLE IF EXISTS CategoryNested;
DROP TABLE IF EXISTS CategoryAdjacency;

CREATE TABLE CategoryClosure (
    id SERIAL PRIMARY KEY,
    name varchar(256)
);

CREATE TABLE CategoryClosure_closure (
    ancestor int,
    descendant int ,
    depth int NOT NULL,
    PRIMARY KEY(ancestor, descendant),
    UNIQUE (descendant, depth),
    CONSTRAINT fk_ancestor
        FOREIGN KEY(ancestor) REFERENCES CategoryClosure(id) ON DELETE CASCADE ,
    CONSTRAINT fk_descendant
        FOREIGN KEY(descendant) REFERENCES CategoryClosure(id) ON DELETE CASCADE
);

CREATE TABLE CategoryMaterialized (
                                 id SERIAL PRIMARY KEY,
                                 name varchar(256),
                                 path text UNIQUE NOT NULL
);

CREATE TABLE CategoryNested (
                              id SERIAL PRIMARY KEY,
                              name varchar(256),
                              leftNode int,
                              rightNode int
);

CREATE TABLE CategoryAdjacency (
                                 id SERIAL PRIMARY KEY,
                                 name varchar(256),
                                 parent int
);