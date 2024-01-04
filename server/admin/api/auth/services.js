const db = require('../../../config/connectDB') 
const Response = require('../../../utils/Response') 
const LOGGER = require('../../../utils/logger') 
const bcrypt = require('bcryptjs') 
const jwt = require('jsonwebtoken') 
const { ACCOUNT_TYPE, USER_ROLE, GENDER, USER_ACTION_TYPE} = require('../../../utils/strVar') ;
const { randomString } = require('../../../utils/randomString') ;
const { sendMailSimpleNotResponse } = require('../../../utils/sendMailUtils') 
const { getSnsInformation } = require('../../../utils/snsUtils');
const EmailTemplate = require('../../../templates/emailTemplate') ;

var macaddress = require('macaddress');
require('dotenv').config()


const pointRegister = parseInt(process.env.POINT_REGISTER);
console.log("point register:", pointRegister);
const dataSnsOld = {
  'snsIdNew': {
    //user information of old account from artnguide
    user_id: 1,
    snsId: 'snsidold',
    //...... something
  },
  '123456': {
    //user information of old account from artnguide
    user_id: 1,
    snsId: 'snsidold',
    //...... something
  }
}
class AuthServices {
  static async signUp(data) {
    const trx = await db.transaction();
    try {
      const connection = trx('user');
      let { userName,
        email,
        gender = GENDER.MALE,
        snsId,
        password,
        displayName,
        joinType = ACCOUNT_TYPE.NORMAL, // OR "YEOLMAE"
        userRole = USER_ROLE.WRITE,
        emailReceive = false,
        smsReceive = false
      } = data;

      if (!ACCOUNT_TYPE[joinType]) {
        return Response.ERROR(500, `Join Type:${joinType} not support`, "auh_001");
      }
      if (!GENDER[gender]) {
        return Response.ERROR(500, `Gender:${gender} not found`, "auh_002");
      }

      if (!USER_ROLE[userRole]) {
        return Response.ERROR(500, `User role:${userRole} not support`, "auh_003");
      }

      const existingUser = await connection.clone()
        .where({ user_name: userName.trim() })
        // .orWhere({ email })
        .first();
      // console.log(existingUser);
      if (existingUser) {
        return Response.WARN(400, 'The user name or email has already existed!', "auh_004")
      }


      const hashedPassword = bcrypt.hashSync(password, 8)
      const dataToBeInserted = {
        user_name: userName.trim(),
        email,
        gender: GENDER[gender],
        password: hashedPassword,
        display_name: displayName,
        account_type: ACCOUNT_TYPE[joinType],
        avatar: process.env.USER_AVATAR,
        sms_receive: smsReceive,
        email_receive: emailReceive,
        // birth_date: birthDate,
        sns_id: snsId,
        user_role: USER_ROLE[userRole],
        active: USER_ROLE[userRole] == USER_ROLE.WRITE,
        point: pointRegister ?? 0
      }



      const [id] = await connection.insert(dataToBeInserted, ['id']);
      await trx.commit();
      // sendMsgQuick(phone, KKO_TEMPLATE_CODE.ANG_USER_001, MessageTemplate.signupComplete(displayName, dataToBeInserted.user_name))

      return Response.SUCCESS('Sign up successfully!')
    } catch (error) {
      await trx.rollback();
      LOGGER.APP.error(error.stack)
      return Response.ERROR(500, error.message, "sv_500")
    } finally {
      await trx.commit()
    }
  }

  static async signIn(data) {
    try {
      const connection = db('user')
      const { userName, password, verifiedAt } = data
      const user = await connection.where({ user_name: userName.trim()}).first()
      if (!user) {
        return Response.WARN(404, 'User not found!', "auh_404");
      }
      if (user.active == false) {
        return Response.WARN(404, 'User not active, contact admin!', "auh_005");
      }
      if (user.is_delete == true) {
        return Response.ERROR(500, "Account not found", "auh_404");
      }
      if (user.leave == true) {
        return Response.ERROR(500, "Account was leave", "auh_404");
      }

      const isPasswordValid = bcrypt.compareSync(password, user.password)
      if (!isPasswordValid) {
        return Response.WARN(400, 'Invalid password!', "auh_006")
      }

      await connection.update({ last_login: new Date() }).increment("login_count", 1).where({ id: user.id });
      // await db('user_action').insert({ user_id: user.id, type: USER_ACTION_TYPE.LOGIN, ip_address: ipIdentify?.ip });
 
      // Check mã định danh tại đây
      const dataToBeSigned = {
        id: user.id,
        userName: user.user_name,
        avatar: user.avatar,
        email: user.email,
        accountType: user.account_type,
        userRole: user.user_role,
        displayName: user.display_name
      }
      const accessToken = jwt.sign(dataToBeSigned, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.TOKEN_EXPIRY_TIME
      })
      const dataToBeSent = {
        id: user.id,
        userName: user.user_name,
        email: user.email,
        avatar: user.avatar,
        accountType: user.account_type,
        userRole: user.user_role,
        displayName: user.display_name,
        accessToken
      }
      return Response.SUCCESS('Sign in successfully!', dataToBeSent)
      // if (dataToBeSigned.accountType == 'YEOLMAE') {
      //   const accessToken = jwt.sign(dataToBeSigned, process.env.ACCESS_TOKEN_SECRET, {
      //     expiresIn: process.env.TOKEN_EXPIRY_TIME
      //   })
      //   const dataToBeSent = {
      //     id: user.id,
      //     userName: user.user_name,
      //     email: user.email,
      //     avatar: user.avatar,
      //     accountType: user.account_type,
      //     userRole: user.user_role,
      //     displayName: user.display_name,
      //     accessToken
      //   }
      //   return Response.SUCCESS('Sign in successfully!', dataToBeSent)
      // } else if (dataToBeSigned.accountType == 'NORMAL') {
      //   if (user.verified_device === null) {
      //     if (!verifiedAt) {
      //       return Response.WARN(400, 'No identifier sent!', "auh_007")
      //     }
      //     await connection.update({ verified_device: verifiedAt }).where({ user_name: userName.trim(),is_delete: false })
      //     const accessToken = jwt.sign(dataToBeSigned, process.env.ACCESS_TOKEN_SECRET, {
      //       expiresIn: process.env.TOKEN_EXPIRY_TIME
      //     })
      //     const dataToBeSent = {
      //       id: user.id,
      //       userName: user.user_name,
      //       email: user.email,
      //       avatar: user.avatar,
      //       accountType: user.account_type,
      //       userRole: user.user_role,
      //       displayName: user.display_name,
      //       accessToken
      //     }
      //     return Response.SUCCESS('Sign in successfully!', dataToBeSent)
      //   } else {
      //     if (verifiedAt) {
      //       if (verifiedAt === user.verified_device) {
             
      //       } else if (verifiedAt !== user.verified_device) {
      //         return Response.WARN(400, 'You have login in other device!', "auh_008")
      //       }
      //     } else {
      //       return Response.WARN(400, 'No identifier sent!', "auh_007")
      //     }
      //   } 
      // }
    } catch (error) {
      LOGGER.APP.error(error.stack)
      return Response.ERROR(500, error.message, "sv_500")
    }
  }

  // static async signInSns(data, ipIdentify) {
  //   try {

  //     const { snsAccessTokenOrCode, snsType } = data;
  //     if (!ACCOUNT_TYPE[snsType]) {
  //       return Response.ERROR(500, `SNS:${snsType} not support`, "auh_007");
  //     }

  //     const snsResp = await getSnsInformation(snsAccessTokenOrCode, ACCOUNT_TYPE[snsType]);

  //     if (snsResp) {
  //       console.log(typeof snsResp);
  //       var snsData = typeof snsResp == 'object' ? snsResp : JSON.parse(snsResp); // object have information of SNS
  //       console.log(snsData);
  //       const connection = db('user');
  //       const user = await connection.where({ sns_id: snsData.id, account_type: snsData.type, }).first();
  //       if (!user) {
  //         return Response.SUCCESS(200, { requiredRegister: true, snsData: snsData });
  //       }
  //       if (user.leave == true) {
  //         return Response.ERROR(500, "Account was leave", "auh_008");
  //       }
  //       if (user.is_delete == true) {
  //         return Response.ERROR(500, "Account not found", "auh_404");
  //       }

  //       await connection.update({ last_login: new Date() }).increment("login_count", 1).where({ id: user.id });
  //       await db('user_action').insert({ user_id: user.id, type: USER_ACTION_TYPE.LOGIN, ip_address: ipIdentify?.ip });

  //       const dataToBeSigned = {
  //         id: user.id,
  //         userName: user.user_name,
  //         avatar: user.avatar,
  //         email: user.email,
  //         accountType: user.account_type,
  //         userRole: user.user_role,
  //         displayName: user.display_name
  //       }

  //       const accessToken = jwt.sign(dataToBeSigned, process.env.ACCESS_TOKEN_SECRET, {
  //         expiresIn: process.env.TOKEN_EXPIRY_TIME
  //       })

  //       const dataToBeSent = {
  //         id: user.id,
  //         userName: user.user_name,
  //         email: user.email,
  //         avatar: user.avatar,
  //         accountType: user.account_type,
  //         userRole: user.user_role,
  //         displayName: user.display_name,
  //         accessToken,
  //         //chạy schedule
  //         requiredRegister: !!dataSnsOld[snsid],

  //       }
  //       return Response.SUCCESS('Sign in successfully!', dataToBeSent)
  //     } else {
  //       return Response.ERROR(500, "Cannot finding information SNS account", "auh_sns_500");
  //     }


  //   } catch (error) {
  //     LOGGER.APP.error(error.stack)
  //     return Response.ERROR(500, error.message, "sv_500")
  //   }
  // }


  static async changePassword(requestUser, data) {
    try {
      const connection = db('user')
      const { userName } = requestUser
      const { oldPassword, newPassword } = data

      const user = await connection.clone().where({ user_name: userName }).first()
      if (!user) {
        return Response.WARN(404, 'User not found!', "auh_404")
      }

      const isPasswordValid = bcrypt.compareSync(oldPassword, user.password)
      if (!isPasswordValid) {
        return Response.WARN(400, 'Invalid old password!', "auh_006")
      }

      const hashedPassword = bcrypt.hashSync(newPassword, 8)
      await connection.clone().update({ password: hashedPassword }).where({ id: user.id })

      return Response.SUCCESS('Change password successfully!')
    } catch (error) {
      LOGGER.APP.error(error.stack)
      return Response.ERROR(500, error.message, "sv_500")
    }
  }

  static async findIdByEmail(data) {
    try {
      const connection = db('user');
      const { email } = data;


      const users = await connection.clone().where({ email: email, leave: false, });
      if (!users || users?.length <= 0) {
        return Response.WARN(404, 'User not found!', "auh_404")
      }
      const body = EmailTemplate.findId(
        users.filter(e => e.account_type == ACCOUNT_TYPE.NORMAL).map(e => e.user_name).join(", "),
        users.some(e => e.account_type == ACCOUNT_TYPE.GG),
        users.some(e => e.account_type == ACCOUNT_TYPE.FB),
        users.some(e => e.account_type == ACCOUNT_TYPE.NAVER),
        users.some(e => e.account_type == ACCOUNT_TYPE.KAKAO),
      );
      console.log(body);
      sendMailSimpleNotResponse(users[0].email, "안녕하세요. 아트앤가이드입니다.", body);
      return Response.SUCCESS('Id will send to your email!');
    } catch (error) {
      LOGGER.APP.error(error.stack)
      return Response.ERROR(500, error.message, "sv_500")
    }
  }

  static async recoveryPassword(data) {
    try {
      const connection = db('user');
      const { email, userName } = data;


      const user = await connection.clone().where({ 'user.email': email, 'user.user_name': userName, leave: false, account_type: ACCOUNT_TYPE.NORMAL })
        .leftJoin("buyer_information as bi", "bi.user_id", "user.id")
        .select("user.*", "bi.phone_number")
        .first()
      if (!user) {
        return Response.WARN(404, 'User not found!', "auh_404")
      }

      const newPassword = randomString(8);
      const hashedPassword = bcrypt.hashSync(newPassword, 8);
      await connection.clone().update({ password: hashedPassword, update_time: new Date(), pw_encrypt_method: "NEW", }).where({ id: user.id });
      sendMailSimpleNotResponse(user.email, "안녕하세요. 아트앤가이드 입니다.", EmailTemplate.recoveryPassword(newPassword));

      return Response.SUCCESS('Going to verified');



    } catch (error) {
      LOGGER.APP.error(error.stack)
      return Response.ERROR(500, error.message, "sv_500")
    }
  }


}

module.exports =  AuthServices
