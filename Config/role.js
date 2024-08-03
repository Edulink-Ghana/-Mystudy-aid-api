

export const roles = [
    {
        role: 'superadmin',
        permissions:[
            'create_user',
            'read_users',
            'update_user',
            'delete_user',
            'update_teacher',
            'read_teachers',
            'delete_teacher',
        ]
    },
    {
        role: 'admin',
        permissions:[
            'create_user',
            'read_users',
            'update_user',
            'read_teachers',
            'update_teacher',
        ]
    },
    {
        role: 'teacher',
        permissions: [
            'update_teacher',
            'read_teacher',
            'create_teacher',
        ]
    },
    {
        role: 'user',
        permissions: [
            'update_user',
            'read_user',
        ]
    }
];