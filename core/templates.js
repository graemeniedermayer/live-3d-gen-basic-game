
// JSON for server

let character_template = {
    'name': '',
    'server_id': '',
    // for saving/server
    'model_src': '',
    'image_src': '',
    'inventory_server_id': 'unique_id',
    'inventory': 'unique_id',
    'active_stats':{
        // calculated numbers based on skill+equipment
        'level': 10,
        'max_health': 10,
        'current_health': 10,
        'attack': 10,
        'defence': 10,
    },
    'base_stats': {
        // calculated numbers based on skill+equipment
        'level': 10,
        'max_health': 10,
        'current_health': 10,
        'attack': 10,
        'defence': 10,
    },
    'skills': {
    //   'name_skill':'xp of skill',
    //  display lvl
        'archery': 1,
        'magic': 1,
        'melee': 1,
        'defence': 1
    },
}

let inventory_template = {
    'server_id':'unique_id',
    'active_items':{
        // These should have models that are loaded/unloaded
        'head':'item_id',
        'amulet':'item_id',
        'rings':'item_id',
        'body':'item_id',
        'legs':'item_id',
        'boots':'item_id',
        'gauntlets':'item_id',
        'weapon':'item_id',
        'alt_weapon':'item_id',
    },
    'bartering_items':[],
    'all_items':[],
}

let item_template = {
    'name':'diplayed_name',
    'image_icon': 'image_place',
    'id':'unique_id',
    'stats':{
        'attack': 0,
        'defence': 0,
        'max_health': 0,
        'multiply_attack': 0,
        'multiply_defence': 0,
        'multiply_max_health': 0,
    },
    'abilities':{
        'name_of_abilities':0
    },
    'model_id':'',
    'description':'',
    'quantity':1,
    'value':0,
}

export {item_template, character_template, inventory_template}