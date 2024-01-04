const { USER_ROLE } = require('../../utils/strVar');

const userModel = (knex) => {
  return knex.schema.hasTable('user').then(function (exists) {
    if (!exists) {
      return knex.schema.createTable('user', function (property) {
        property.increments('id').unsigned().primary();
        property.string('user_name', 255).notNullable().unique();
        property.string('email', 255);
        property.text('password').notNullable();
        property.string('display_name', 255);
        property.text('avatar');
        property.string('sns_id', 255);
        property.string('gender', 20); //gender
        property.string('account_type'); // normal, google, facebook, naver, kakao
        property.string('user_role').defaultTo(USER_ROLE.READ); // READ, WRITE
        property.datetime('create_time').notNullable().defaultTo(knex.raw('NOW()'));
        property.datetime('update_time');
        property.datetime('last_login');
        // property.boolean('email_receive').defaultTo(false); // nhận thông báo qua email
        // property.boolean('sms_receive').defaultTo(false); // nhận thông báo qua sms
        // property.boolean('active').defaultTo(true); // tài khoản đã được active hay chưa
        // property.decimal('point', 20, 0).defaultTo(0);
        // property.integer('login_count').defaultTo(0);
        // property.boolean('leave').defaultTo(false); // user leave
        // property.boolean('is_delete').defaultTo(0); // account delete
        // property.boolean('auth_verified').defaultTo(false);
        // property.string('verified_device', 255);
        // property.string('pw_encrypt_method',20).defaultTo("NEW");
        // property.string('id_origin_artnguide', 255).comment("Id user từ bảng của artnguide cũ");
        // property.string('clone_of_uid', 255).comment("clone của user id nào, trường hợp đối với naver, kakao");
        // property.boolean('request_leave').defaultTo(false);
        // property.datetime('request_leave_at')
        // property.boolean('need_migration').defaultTo(false);
        // property.string('old_phone_number', 255);
        // property.text('admin_note');
        property.datetime('verified_at');
        property.datetime('registered_at').defaultTo(knex.raw('NOW()'));
      })
    }
  })
}

module.exports = {
  userModel
}
