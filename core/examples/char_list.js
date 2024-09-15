let char_list = [
    {
        'name': 'Elliot',
        'server_id': 'c0001',
        'model_src': 'static/ArExperiment/charEditor/characters/elf.glb',
        'image_src': '',
        // for saving/server
        'inventory_server_id': 'i0001',
        'inventory': 'i0001',
        'active_stats':{
            // calculated numbers based on skill+equipment
            'level': 13,
            'max_health': 12,
            'current_health': 11,
            'attack': 12,
            'defence': 12,
        },
        'base_stats': {
            // calculated numbers based on skill+equipment
            'level': 12,
            'max_health': 12,
            'current_health': 11,
            'attack': 12,
            'defence': 12,
        },
        'skills': {
        //   'name_skill':'xp of skill',
        //  display lvl
            'archery': 3,
            'magic': 1,
            'melee': 2,
            'defence': 1
        },
    },
    {
        'name': 'Franz',
        'server_id': '',
        'model_src': '',
        'image_src': '',
        // for saving/server
        'inventory_server_id': 'i0002',
        'inventory': 'i0002',
        'active_stats':{
            // calculated numbers based on skill+equipment
            'level': 7,
            'max_health': 12,
            'current_health': 12,
            'attack': 6,
            'defence': 8,
        },
        'base_stats': {
            // calculated numbers based on skill+equipment
            'level': 7,
            'max_health': 12,
            'current_health': 12,
            'attack': 6,
            'defence': 8,
        },
        'skills': {
        //   'name_skill':'xp of skill',
        //  display lvl
            'archery': 2,
            'magic': 1,
            'melee': 5,
            'defence': 1
        },
    }
]

export {char_list}