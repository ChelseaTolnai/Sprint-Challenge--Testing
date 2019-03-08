exports.up = function(knex, Promise) {
	return knex.schema.createTable('games', function(tbl) {
        tbl.string('title', 255).unique().notNullable();
        tbl.string('genre', 255).notNullable();
		tbl.integer('releaseYear');
	});
};
exports.down = function(knex, Promise) {
	return knex.schema.dropTableIfExists('games');
};