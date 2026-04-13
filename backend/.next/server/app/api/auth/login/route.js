/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/auth/login/route";
exports.ids = ["app/api/auth/login/route"];
exports.modules = {

/***/ "(rsc)/./app/api/auth/login/route.ts":
/*!*************************************!*\
  !*** ./app/api/auth/login/route.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   OPTIONS: () => (/* binding */ OPTIONS),\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var zod__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! zod */ \"(rsc)/./node_modules/zod/v3/types.js\");\n/* harmony import */ var _lib_cors__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/cors */ \"(rsc)/./lib/cors.ts\");\n/* harmony import */ var _lib_authStore__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/lib/authStore */ \"(rsc)/./lib/authStore.ts\");\n\n\n\n\nconst loginSchema = zod__WEBPACK_IMPORTED_MODULE_3__.object({\n    username: zod__WEBPACK_IMPORTED_MODULE_3__.string().min(3).max(32),\n    password: zod__WEBPACK_IMPORTED_MODULE_3__.string().min(6).max(64)\n});\nasync function OPTIONS(request) {\n    return (0,_lib_cors__WEBPACK_IMPORTED_MODULE_1__.withCors)(new next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse(null, {\n        status: 204\n    }), request.headers.get(\"origin\"));\n}\nasync function POST(request) {\n    const origin = request.headers.get(\"origin\");\n    const body = await request.json().catch(()=>null);\n    const parsed = loginSchema.safeParse(body);\n    if (!parsed.success) {\n        return (0,_lib_cors__WEBPACK_IMPORTED_MODULE_1__.withCors)(next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Invalid login data\"\n        }, {\n            status: 400\n        }), origin);\n    }\n    const user = await (0,_lib_authStore__WEBPACK_IMPORTED_MODULE_2__.validateUser)(parsed.data.username, parsed.data.password);\n    if (!user) {\n        return (0,_lib_cors__WEBPACK_IMPORTED_MODULE_1__.withCors)(next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Invalid username or password\"\n        }, {\n            status: 401\n        }), origin);\n    }\n    return (0,_lib_cors__WEBPACK_IMPORTED_MODULE_1__.withCors)(next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n        user\n    }), origin);\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2F1dGgvbG9naW4vcm91dGUudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQXdEO0FBQ2hDO0FBQ2M7QUFDUztBQUUvQyxNQUFNSSxjQUFjSCx1Q0FBUSxDQUFDO0lBQzNCSyxVQUFVTCx1Q0FBUSxHQUFHTyxHQUFHLENBQUMsR0FBR0MsR0FBRyxDQUFDO0lBQ2hDQyxVQUFVVCx1Q0FBUSxHQUFHTyxHQUFHLENBQUMsR0FBR0MsR0FBRyxDQUFDO0FBQ2xDO0FBRU8sZUFBZUUsUUFBUUMsT0FBb0I7SUFDaEQsT0FBT1YsbURBQVFBLENBQ2IsSUFBSUYscURBQVlBLENBQUMsTUFBTTtRQUFFYSxRQUFRO0lBQUksSUFDckNELFFBQVFFLE9BQU8sQ0FBQ0MsR0FBRyxDQUFDO0FBRXhCO0FBRU8sZUFBZUMsS0FBS0osT0FBb0I7SUFDN0MsTUFBTUssU0FBU0wsUUFBUUUsT0FBTyxDQUFDQyxHQUFHLENBQUM7SUFDbkMsTUFBTUcsT0FBTyxNQUFNTixRQUFRTyxJQUFJLEdBQUdDLEtBQUssQ0FBQyxJQUFNO0lBQzlDLE1BQU1DLFNBQVNqQixZQUFZa0IsU0FBUyxDQUFDSjtJQUVyQyxJQUFJLENBQUNHLE9BQU9FLE9BQU8sRUFBRTtRQUNuQixPQUFPckIsbURBQVFBLENBQ2JGLHFEQUFZQSxDQUFDbUIsSUFBSSxDQUFDO1lBQUVLLE9BQU87UUFBcUIsR0FBRztZQUFFWCxRQUFRO1FBQUksSUFDakVJO0lBRUo7SUFFQSxNQUFNUSxPQUFPLE1BQU10Qiw0REFBWUEsQ0FBQ2tCLE9BQU9LLElBQUksQ0FBQ3BCLFFBQVEsRUFBRWUsT0FBT0ssSUFBSSxDQUFDaEIsUUFBUTtJQUMxRSxJQUFJLENBQUNlLE1BQU07UUFDVCxPQUFPdkIsbURBQVFBLENBQ2JGLHFEQUFZQSxDQUFDbUIsSUFBSSxDQUNmO1lBQUVLLE9BQU87UUFBK0IsR0FDeEM7WUFBRVgsUUFBUTtRQUFJLElBRWhCSTtJQUVKO0lBRUEsT0FBT2YsbURBQVFBLENBQUNGLHFEQUFZQSxDQUFDbUIsSUFBSSxDQUFDO1FBQUVNO0lBQUssSUFBSVI7QUFDL0MiLCJzb3VyY2VzIjpbIkQ6XFxQZXJzb25hbF9Qcm9qZWN0XFx5b3V0dWJlLXVpXFxiYWNrZW5kXFxhcHBcXGFwaVxcYXV0aFxcbG9naW5cXHJvdXRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5leHRSZXF1ZXN0LCBOZXh0UmVzcG9uc2UgfSBmcm9tIFwibmV4dC9zZXJ2ZXJcIjtcclxuaW1wb3J0IHsgeiB9IGZyb20gXCJ6b2RcIjtcclxuaW1wb3J0IHsgd2l0aENvcnMgfSBmcm9tIFwiQC9saWIvY29yc1wiO1xyXG5pbXBvcnQgeyB2YWxpZGF0ZVVzZXIgfSBmcm9tIFwiQC9saWIvYXV0aFN0b3JlXCI7XHJcblxyXG5jb25zdCBsb2dpblNjaGVtYSA9IHoub2JqZWN0KHtcclxuICB1c2VybmFtZTogei5zdHJpbmcoKS5taW4oMykubWF4KDMyKSxcclxuICBwYXNzd29yZDogei5zdHJpbmcoKS5taW4oNikubWF4KDY0KSxcclxufSk7XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gT1BUSU9OUyhyZXF1ZXN0OiBOZXh0UmVxdWVzdCk6IFByb21pc2U8TmV4dFJlc3BvbnNlPiB7XHJcbiAgcmV0dXJuIHdpdGhDb3JzKFxyXG4gICAgbmV3IE5leHRSZXNwb25zZShudWxsLCB7IHN0YXR1czogMjA0IH0pLFxyXG4gICAgcmVxdWVzdC5oZWFkZXJzLmdldChcIm9yaWdpblwiKSxcclxuICApO1xyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gUE9TVChyZXF1ZXN0OiBOZXh0UmVxdWVzdCk6IFByb21pc2U8TmV4dFJlc3BvbnNlPiB7XHJcbiAgY29uc3Qgb3JpZ2luID0gcmVxdWVzdC5oZWFkZXJzLmdldChcIm9yaWdpblwiKTtcclxuICBjb25zdCBib2R5ID0gYXdhaXQgcmVxdWVzdC5qc29uKCkuY2F0Y2goKCkgPT4gbnVsbCk7XHJcbiAgY29uc3QgcGFyc2VkID0gbG9naW5TY2hlbWEuc2FmZVBhcnNlKGJvZHkpO1xyXG5cclxuICBpZiAoIXBhcnNlZC5zdWNjZXNzKSB7XHJcbiAgICByZXR1cm4gd2l0aENvcnMoXHJcbiAgICAgIE5leHRSZXNwb25zZS5qc29uKHsgZXJyb3I6IFwiSW52YWxpZCBsb2dpbiBkYXRhXCIgfSwgeyBzdGF0dXM6IDQwMCB9KSxcclxuICAgICAgb3JpZ2luLFxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHVzZXIgPSBhd2FpdCB2YWxpZGF0ZVVzZXIocGFyc2VkLmRhdGEudXNlcm5hbWUsIHBhcnNlZC5kYXRhLnBhc3N3b3JkKTtcclxuICBpZiAoIXVzZXIpIHtcclxuICAgIHJldHVybiB3aXRoQ29ycyhcclxuICAgICAgTmV4dFJlc3BvbnNlLmpzb24oXHJcbiAgICAgICAgeyBlcnJvcjogXCJJbnZhbGlkIHVzZXJuYW1lIG9yIHBhc3N3b3JkXCIgfSxcclxuICAgICAgICB7IHN0YXR1czogNDAxIH0sXHJcbiAgICAgICksXHJcbiAgICAgIG9yaWdpbixcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gd2l0aENvcnMoTmV4dFJlc3BvbnNlLmpzb24oeyB1c2VyIH0pLCBvcmlnaW4pO1xyXG59XHJcbiJdLCJuYW1lcyI6WyJOZXh0UmVzcG9uc2UiLCJ6Iiwid2l0aENvcnMiLCJ2YWxpZGF0ZVVzZXIiLCJsb2dpblNjaGVtYSIsIm9iamVjdCIsInVzZXJuYW1lIiwic3RyaW5nIiwibWluIiwibWF4IiwicGFzc3dvcmQiLCJPUFRJT05TIiwicmVxdWVzdCIsInN0YXR1cyIsImhlYWRlcnMiLCJnZXQiLCJQT1NUIiwib3JpZ2luIiwiYm9keSIsImpzb24iLCJjYXRjaCIsInBhcnNlZCIsInNhZmVQYXJzZSIsInN1Y2Nlc3MiLCJlcnJvciIsInVzZXIiLCJkYXRhIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/api/auth/login/route.ts\n");

/***/ }),

/***/ "(rsc)/./lib/authStore.ts":
/*!**************************!*\
  !*** ./lib/authStore.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   createUser: () => (/* binding */ createUser),\n/* harmony export */   validateUser: () => (/* binding */ validateUser)\n/* harmony export */ });\n/* harmony import */ var _vercel_kv__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @vercel/kv */ \"(rsc)/./node_modules/@vercel/kv/dist/index.js\");\n\nconst inMemoryUsers = [];\nconst USERS_KEY = \"auth:users\";\nconst hasKv = ()=>!!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;\nconst randomId = ()=>typeof crypto !== \"undefined\" && \"randomUUID\" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;\nconst getUsers = async ()=>{\n    if (hasKv()) {\n        return await _vercel_kv__WEBPACK_IMPORTED_MODULE_0__.kv.get(USERS_KEY) || [];\n    }\n    return inMemoryUsers;\n};\nconst setUsers = async (users)=>{\n    if (hasKv()) {\n        await _vercel_kv__WEBPACK_IMPORTED_MODULE_0__.kv.set(USERS_KEY, users);\n        return;\n    }\n    inMemoryUsers.length = 0;\n    inMemoryUsers.push(...users);\n};\nconst createUser = async (username, password)=>{\n    const normalizedUsername = username.trim().toLowerCase();\n    const users = await getUsers();\n    const exists = users.some((u)=>u.username.toLowerCase() === normalizedUsername);\n    if (exists) {\n        throw new Error(\"Username already exists\");\n    }\n    const createdUser = {\n        id: randomId(),\n        username: username.trim(),\n        password,\n        createdAt: new Date().toISOString()\n    };\n    await setUsers([\n        createdUser,\n        ...users\n    ]);\n    return {\n        id: createdUser.id,\n        username: createdUser.username\n    };\n};\nconst validateUser = async (username, password)=>{\n    const users = await getUsers();\n    const normalizedUsername = username.trim().toLowerCase();\n    const user = users.find((u)=>u.username.toLowerCase() === normalizedUsername && u.password === password);\n    if (!user) {\n        return null;\n    }\n    return {\n        id: user.id,\n        username: user.username\n    };\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvYXV0aFN0b3JlLnRzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUFnQztBQVNoQyxNQUFNQyxnQkFBOEIsRUFBRTtBQUN0QyxNQUFNQyxZQUFZO0FBRWxCLE1BQU1DLFFBQVEsSUFDWixDQUFDLENBQUNDLFFBQVFDLEdBQUcsQ0FBQ0MsZUFBZSxJQUFJLENBQUMsQ0FBQ0YsUUFBUUMsR0FBRyxDQUFDRSxpQkFBaUI7QUFFbEUsTUFBTUMsV0FBVyxJQUNmLE9BQU9DLFdBQVcsZUFBZSxnQkFBZ0JBLFNBQzdDQSxPQUFPQyxVQUFVLEtBQ2pCLEdBQUdDLEtBQUtDLEdBQUcsR0FBRyxDQUFDLEVBQUVDLEtBQUtDLE1BQU0sR0FBR0MsUUFBUSxDQUFDLElBQUlDLEtBQUssQ0FBQyxHQUFHLEtBQUs7QUFFaEUsTUFBTUMsV0FBVztJQUNmLElBQUlkLFNBQVM7UUFDWCxPQUFPLE1BQU9ILDBDQUFFQSxDQUFDa0IsR0FBRyxDQUFlaEIsY0FBZSxFQUFFO0lBQ3REO0lBQ0EsT0FBT0Q7QUFDVDtBQUVBLE1BQU1rQixXQUFXLE9BQU9DO0lBQ3RCLElBQUlqQixTQUFTO1FBQ1gsTUFBTUgsMENBQUVBLENBQUNxQixHQUFHLENBQUNuQixXQUFXa0I7UUFDeEI7SUFDRjtJQUVBbkIsY0FBY3FCLE1BQU0sR0FBRztJQUN2QnJCLGNBQWNzQixJQUFJLElBQUlIO0FBQ3hCO0FBRU8sTUFBTUksYUFBYSxPQUN4QkMsVUFDQUM7SUFFQSxNQUFNQyxxQkFBcUJGLFNBQVNHLElBQUksR0FBR0MsV0FBVztJQUN0RCxNQUFNVCxRQUFRLE1BQU1IO0lBRXBCLE1BQU1hLFNBQVNWLE1BQU1XLElBQUksQ0FDdkIsQ0FBQ0MsSUFBTUEsRUFBRVAsUUFBUSxDQUFDSSxXQUFXLE9BQU9GO0lBRXRDLElBQUlHLFFBQVE7UUFDVixNQUFNLElBQUlHLE1BQU07SUFDbEI7SUFFQSxNQUFNQyxjQUEwQjtRQUM5QkMsSUFBSTNCO1FBQ0ppQixVQUFVQSxTQUFTRyxJQUFJO1FBQ3ZCRjtRQUNBVSxXQUFXLElBQUl6QixPQUFPMEIsV0FBVztJQUNuQztJQUVBLE1BQU1sQixTQUFTO1FBQUNlO1dBQWdCZDtLQUFNO0lBQ3RDLE9BQU87UUFBRWUsSUFBSUQsWUFBWUMsRUFBRTtRQUFFVixVQUFVUyxZQUFZVCxRQUFRO0lBQUM7QUFDOUQsRUFBRTtBQUVLLE1BQU1hLGVBQWUsT0FDMUJiLFVBQ0FDO0lBRUEsTUFBTU4sUUFBUSxNQUFNSDtJQUNwQixNQUFNVSxxQkFBcUJGLFNBQVNHLElBQUksR0FBR0MsV0FBVztJQUV0RCxNQUFNVSxPQUFPbkIsTUFBTW9CLElBQUksQ0FDckIsQ0FBQ1IsSUFDQ0EsRUFBRVAsUUFBUSxDQUFDSSxXQUFXLE9BQU9GLHNCQUM3QkssRUFBRU4sUUFBUSxLQUFLQTtJQUduQixJQUFJLENBQUNhLE1BQU07UUFDVCxPQUFPO0lBQ1Q7SUFFQSxPQUFPO1FBQUVKLElBQUlJLEtBQUtKLEVBQUU7UUFBRVYsVUFBVWMsS0FBS2QsUUFBUTtJQUFDO0FBQ2hELEVBQUUiLCJzb3VyY2VzIjpbIkQ6XFxQZXJzb25hbF9Qcm9qZWN0XFx5b3V0dWJlLXVpXFxiYWNrZW5kXFxsaWJcXGF1dGhTdG9yZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBrdiB9IGZyb20gXCJAdmVyY2VsL2t2XCI7XHJcblxyXG5pbnRlcmZhY2UgU3RvcmVkVXNlciB7XHJcbiAgaWQ6IHN0cmluZztcclxuICB1c2VybmFtZTogc3RyaW5nO1xyXG4gIHBhc3N3b3JkOiBzdHJpbmc7XHJcbiAgY3JlYXRlZEF0OiBzdHJpbmc7XHJcbn1cclxuXHJcbmNvbnN0IGluTWVtb3J5VXNlcnM6IFN0b3JlZFVzZXJbXSA9IFtdO1xyXG5jb25zdCBVU0VSU19LRVkgPSBcImF1dGg6dXNlcnNcIjtcclxuXHJcbmNvbnN0IGhhc0t2ID0gKCkgPT5cclxuICAhIXByb2Nlc3MuZW52LktWX1JFU1RfQVBJX1VSTCAmJiAhIXByb2Nlc3MuZW52LktWX1JFU1RfQVBJX1RPS0VOO1xyXG5cclxuY29uc3QgcmFuZG9tSWQgPSAoKSA9PlxyXG4gIHR5cGVvZiBjcnlwdG8gIT09IFwidW5kZWZpbmVkXCIgJiYgXCJyYW5kb21VVUlEXCIgaW4gY3J5cHRvXHJcbiAgICA/IGNyeXB0by5yYW5kb21VVUlEKClcclxuICAgIDogYCR7RGF0ZS5ub3coKX0tJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyLCAxMCl9YDtcclxuXHJcbmNvbnN0IGdldFVzZXJzID0gYXN5bmMgKCk6IFByb21pc2U8U3RvcmVkVXNlcltdPiA9PiB7XHJcbiAgaWYgKGhhc0t2KCkpIHtcclxuICAgIHJldHVybiAoYXdhaXQga3YuZ2V0PFN0b3JlZFVzZXJbXT4oVVNFUlNfS0VZKSkgfHwgW107XHJcbiAgfVxyXG4gIHJldHVybiBpbk1lbW9yeVVzZXJzO1xyXG59O1xyXG5cclxuY29uc3Qgc2V0VXNlcnMgPSBhc3luYyAodXNlcnM6IFN0b3JlZFVzZXJbXSk6IFByb21pc2U8dm9pZD4gPT4ge1xyXG4gIGlmIChoYXNLdigpKSB7XHJcbiAgICBhd2FpdCBrdi5zZXQoVVNFUlNfS0VZLCB1c2Vycyk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICBpbk1lbW9yeVVzZXJzLmxlbmd0aCA9IDA7XHJcbiAgaW5NZW1vcnlVc2Vycy5wdXNoKC4uLnVzZXJzKTtcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBjcmVhdGVVc2VyID0gYXN5bmMgKFxyXG4gIHVzZXJuYW1lOiBzdHJpbmcsXHJcbiAgcGFzc3dvcmQ6IHN0cmluZyxcclxuKTogUHJvbWlzZTx7IGlkOiBzdHJpbmc7IHVzZXJuYW1lOiBzdHJpbmcgfT4gPT4ge1xyXG4gIGNvbnN0IG5vcm1hbGl6ZWRVc2VybmFtZSA9IHVzZXJuYW1lLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xyXG4gIGNvbnN0IHVzZXJzID0gYXdhaXQgZ2V0VXNlcnMoKTtcclxuXHJcbiAgY29uc3QgZXhpc3RzID0gdXNlcnMuc29tZShcclxuICAgICh1KSA9PiB1LnVzZXJuYW1lLnRvTG93ZXJDYXNlKCkgPT09IG5vcm1hbGl6ZWRVc2VybmFtZSxcclxuICApO1xyXG4gIGlmIChleGlzdHMpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcihcIlVzZXJuYW1lIGFscmVhZHkgZXhpc3RzXCIpO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgY3JlYXRlZFVzZXI6IFN0b3JlZFVzZXIgPSB7XHJcbiAgICBpZDogcmFuZG9tSWQoKSxcclxuICAgIHVzZXJuYW1lOiB1c2VybmFtZS50cmltKCksXHJcbiAgICBwYXNzd29yZCxcclxuICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxyXG4gIH07XHJcblxyXG4gIGF3YWl0IHNldFVzZXJzKFtjcmVhdGVkVXNlciwgLi4udXNlcnNdKTtcclxuICByZXR1cm4geyBpZDogY3JlYXRlZFVzZXIuaWQsIHVzZXJuYW1lOiBjcmVhdGVkVXNlci51c2VybmFtZSB9O1xyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IHZhbGlkYXRlVXNlciA9IGFzeW5jIChcclxuICB1c2VybmFtZTogc3RyaW5nLFxyXG4gIHBhc3N3b3JkOiBzdHJpbmcsXHJcbik6IFByb21pc2U8eyBpZDogc3RyaW5nOyB1c2VybmFtZTogc3RyaW5nIH0gfCBudWxsPiA9PiB7XHJcbiAgY29uc3QgdXNlcnMgPSBhd2FpdCBnZXRVc2VycygpO1xyXG4gIGNvbnN0IG5vcm1hbGl6ZWRVc2VybmFtZSA9IHVzZXJuYW1lLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xyXG5cclxuICBjb25zdCB1c2VyID0gdXNlcnMuZmluZChcclxuICAgICh1KSA9PlxyXG4gICAgICB1LnVzZXJuYW1lLnRvTG93ZXJDYXNlKCkgPT09IG5vcm1hbGl6ZWRVc2VybmFtZSAmJlxyXG4gICAgICB1LnBhc3N3b3JkID09PSBwYXNzd29yZCxcclxuICApO1xyXG5cclxuICBpZiAoIXVzZXIpIHtcclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHsgaWQ6IHVzZXIuaWQsIHVzZXJuYW1lOiB1c2VyLnVzZXJuYW1lIH07XHJcbn07XHJcbiJdLCJuYW1lcyI6WyJrdiIsImluTWVtb3J5VXNlcnMiLCJVU0VSU19LRVkiLCJoYXNLdiIsInByb2Nlc3MiLCJlbnYiLCJLVl9SRVNUX0FQSV9VUkwiLCJLVl9SRVNUX0FQSV9UT0tFTiIsInJhbmRvbUlkIiwiY3J5cHRvIiwicmFuZG9tVVVJRCIsIkRhdGUiLCJub3ciLCJNYXRoIiwicmFuZG9tIiwidG9TdHJpbmciLCJzbGljZSIsImdldFVzZXJzIiwiZ2V0Iiwic2V0VXNlcnMiLCJ1c2VycyIsInNldCIsImxlbmd0aCIsInB1c2giLCJjcmVhdGVVc2VyIiwidXNlcm5hbWUiLCJwYXNzd29yZCIsIm5vcm1hbGl6ZWRVc2VybmFtZSIsInRyaW0iLCJ0b0xvd2VyQ2FzZSIsImV4aXN0cyIsInNvbWUiLCJ1IiwiRXJyb3IiLCJjcmVhdGVkVXNlciIsImlkIiwiY3JlYXRlZEF0IiwidG9JU09TdHJpbmciLCJ2YWxpZGF0ZVVzZXIiLCJ1c2VyIiwiZmluZCJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./lib/authStore.ts\n");

/***/ }),

/***/ "(rsc)/./lib/cors.ts":
/*!*********************!*\
  !*** ./lib/cors.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   withCors: () => (/* binding */ withCors)\n/* harmony export */ });\nconst getAllowedOrigins = ()=>{\n    const value = process.env.ALLOWED_ORIGINS || \"\";\n    return value.split(\",\").map((v)=>v.trim()).filter(Boolean);\n};\nconst withCors = (response, origin)=>{\n    const allowed = getAllowedOrigins();\n    const allowAll = allowed.length === 0 || allowed.includes(\"*\");\n    const canAllow = allowAll || !!origin && allowed.includes(origin);\n    response.headers.set(\"Access-Control-Allow-Methods\", \"GET,POST,OPTIONS\");\n    response.headers.set(\"Access-Control-Allow-Headers\", \"Content-Type,Authorization\");\n    if (canAllow) {\n        response.headers.set(\"Access-Control-Allow-Origin\", allowAll ? \"*\" : origin);\n    }\n    return response;\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvY29ycy50cyIsIm1hcHBpbmdzIjoiOzs7O0FBRUEsTUFBTUEsb0JBQW9CO0lBQ3hCLE1BQU1DLFFBQVFDLFFBQVFDLEdBQUcsQ0FBQ0MsZUFBZSxJQUFJO0lBQzdDLE9BQU9ILE1BQ0pJLEtBQUssQ0FBQyxLQUNOQyxHQUFHLENBQUMsQ0FBQ0MsSUFBTUEsRUFBRUMsSUFBSSxJQUNqQkMsTUFBTSxDQUFDQztBQUNaO0FBRU8sTUFBTUMsV0FBVyxDQUN0QkMsVUFDQUM7SUFFQSxNQUFNQyxVQUFVZDtJQUNoQixNQUFNZSxXQUFXRCxRQUFRRSxNQUFNLEtBQUssS0FBS0YsUUFBUUcsUUFBUSxDQUFDO0lBQzFELE1BQU1DLFdBQVdILFlBQWEsQ0FBQyxDQUFDRixVQUFVQyxRQUFRRyxRQUFRLENBQUNKO0lBRTNERCxTQUFTTyxPQUFPLENBQUNDLEdBQUcsQ0FBQyxnQ0FBZ0M7SUFDckRSLFNBQVNPLE9BQU8sQ0FBQ0MsR0FBRyxDQUNsQixnQ0FDQTtJQUdGLElBQUlGLFVBQVU7UUFDWk4sU0FBU08sT0FBTyxDQUFDQyxHQUFHLENBQ2xCLCtCQUNBTCxXQUFXLE1BQU9GO0lBRXRCO0lBRUEsT0FBT0Q7QUFDVCxFQUFFIiwic291cmNlcyI6WyJEOlxcUGVyc29uYWxfUHJvamVjdFxceW91dHViZS11aVxcYmFja2VuZFxcbGliXFxjb3JzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5leHRSZXNwb25zZSB9IGZyb20gXCJuZXh0L3NlcnZlclwiO1xyXG5cclxuY29uc3QgZ2V0QWxsb3dlZE9yaWdpbnMgPSAoKTogc3RyaW5nW10gPT4ge1xyXG4gIGNvbnN0IHZhbHVlID0gcHJvY2Vzcy5lbnYuQUxMT1dFRF9PUklHSU5TIHx8IFwiXCI7XHJcbiAgcmV0dXJuIHZhbHVlXHJcbiAgICAuc3BsaXQoXCIsXCIpXHJcbiAgICAubWFwKCh2KSA9PiB2LnRyaW0oKSlcclxuICAgIC5maWx0ZXIoQm9vbGVhbik7XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3Qgd2l0aENvcnMgPSAoXHJcbiAgcmVzcG9uc2U6IE5leHRSZXNwb25zZSxcclxuICBvcmlnaW46IHN0cmluZyB8IG51bGwsXHJcbik6IE5leHRSZXNwb25zZSA9PiB7XHJcbiAgY29uc3QgYWxsb3dlZCA9IGdldEFsbG93ZWRPcmlnaW5zKCk7XHJcbiAgY29uc3QgYWxsb3dBbGwgPSBhbGxvd2VkLmxlbmd0aCA9PT0gMCB8fCBhbGxvd2VkLmluY2x1ZGVzKFwiKlwiKTtcclxuICBjb25zdCBjYW5BbGxvdyA9IGFsbG93QWxsIHx8ICghIW9yaWdpbiAmJiBhbGxvd2VkLmluY2x1ZGVzKG9yaWdpbikpO1xyXG5cclxuICByZXNwb25zZS5oZWFkZXJzLnNldChcIkFjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHNcIiwgXCJHRVQsUE9TVCxPUFRJT05TXCIpO1xyXG4gIHJlc3BvbnNlLmhlYWRlcnMuc2V0KFxyXG4gICAgXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzXCIsXHJcbiAgICBcIkNvbnRlbnQtVHlwZSxBdXRob3JpemF0aW9uXCIsXHJcbiAgKTtcclxuXHJcbiAgaWYgKGNhbkFsbG93KSB7XHJcbiAgICByZXNwb25zZS5oZWFkZXJzLnNldChcclxuICAgICAgXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIixcclxuICAgICAgYWxsb3dBbGwgPyBcIipcIiA6IChvcmlnaW4gYXMgc3RyaW5nKSxcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gcmVzcG9uc2U7XHJcbn07XHJcbiJdLCJuYW1lcyI6WyJnZXRBbGxvd2VkT3JpZ2lucyIsInZhbHVlIiwicHJvY2VzcyIsImVudiIsIkFMTE9XRURfT1JJR0lOUyIsInNwbGl0IiwibWFwIiwidiIsInRyaW0iLCJmaWx0ZXIiLCJCb29sZWFuIiwid2l0aENvcnMiLCJyZXNwb25zZSIsIm9yaWdpbiIsImFsbG93ZWQiLCJhbGxvd0FsbCIsImxlbmd0aCIsImluY2x1ZGVzIiwiY2FuQWxsb3ciLCJoZWFkZXJzIiwic2V0Il0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./lib/cors.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fauth%2Flogin%2Froute&page=%2Fapi%2Fauth%2Flogin%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Flogin%2Froute.ts&appDir=D%3A%5CPersonal_Project%5Cyoutube-ui%5Cbackend%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CPersonal_Project%5Cyoutube-ui%5Cbackend&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fauth%2Flogin%2Froute&page=%2Fapi%2Fauth%2Flogin%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Flogin%2Froute.ts&appDir=D%3A%5CPersonal_Project%5Cyoutube-ui%5Cbackend%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CPersonal_Project%5Cyoutube-ui%5Cbackend&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var D_Personal_Project_youtube_ui_backend_app_api_auth_login_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/auth/login/route.ts */ \"(rsc)/./app/api/auth/login/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/auth/login/route\",\n        pathname: \"/api/auth/login\",\n        filename: \"route\",\n        bundlePath: \"app/api/auth/login/route\"\n    },\n    resolvedPagePath: \"D:\\\\Personal_Project\\\\youtube-ui\\\\backend\\\\app\\\\api\\\\auth\\\\login\\\\route.ts\",\n    nextConfigOutput,\n    userland: D_Personal_Project_youtube_ui_backend_app_api_auth_login_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZhdXRoJTJGbG9naW4lMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRmF1dGglMkZsb2dpbiUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRmF1dGglMkZsb2dpbiUyRnJvdXRlLnRzJmFwcERpcj1EJTNBJTVDUGVyc29uYWxfUHJvamVjdCU1Q3lvdXR1YmUtdWklNUNiYWNrZW5kJTVDYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj1EJTNBJTVDUGVyc29uYWxfUHJvamVjdCU1Q3lvdXR1YmUtdWklNUNiYWNrZW5kJmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUErRjtBQUN2QztBQUNxQjtBQUMwQjtBQUN2RztBQUNBO0FBQ0E7QUFDQSx3QkFBd0IseUdBQW1CO0FBQzNDO0FBQ0EsY0FBYyxrRUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLHNEQUFzRDtBQUM5RDtBQUNBLFdBQVcsNEVBQVc7QUFDdEI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUMwRjs7QUFFMUYiLCJzb3VyY2VzIjpbIiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yb3V0ZS1raW5kXCI7XG5pbXBvcnQgeyBwYXRjaEZldGNoIGFzIF9wYXRjaEZldGNoIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL3BhdGNoLWZldGNoXCI7XG5pbXBvcnQgKiBhcyB1c2VybGFuZCBmcm9tIFwiRDpcXFxcUGVyc29uYWxfUHJvamVjdFxcXFx5b3V0dWJlLXVpXFxcXGJhY2tlbmRcXFxcYXBwXFxcXGFwaVxcXFxhdXRoXFxcXGxvZ2luXFxcXHJvdXRlLnRzXCI7XG4vLyBXZSBpbmplY3QgdGhlIG5leHRDb25maWdPdXRwdXQgaGVyZSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlbSBpbiB0aGUgcm91dGVcbi8vIG1vZHVsZS5cbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcIlwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS9hdXRoL2xvZ2luL3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvYXV0aC9sb2dpblwiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvYXV0aC9sb2dpbi9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIkQ6XFxcXFBlcnNvbmFsX1Byb2plY3RcXFxceW91dHViZS11aVxcXFxiYWNrZW5kXFxcXGFwcFxcXFxhcGlcXFxcYXV0aFxcXFxsb2dpblxcXFxyb3V0ZS50c1wiLFxuICAgIG5leHRDb25maWdPdXRwdXQsXG4gICAgdXNlcmxhbmRcbn0pO1xuLy8gUHVsbCBvdXQgdGhlIGV4cG9ydHMgdGhhdCB3ZSBuZWVkIHRvIGV4cG9zZSBmcm9tIHRoZSBtb2R1bGUuIFRoaXMgc2hvdWxkXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2Vcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXG5jb25zdCB7IHdvcmtBc3luY1N0b3JhZ2UsIHdvcmtVbml0QXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcyB9ID0gcm91dGVNb2R1bGU7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHdvcmtBc3luY1N0b3JhZ2UsXG4gICAgICAgIHdvcmtVbml0QXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgd29ya0FzeW5jU3RvcmFnZSwgd29ya1VuaXRBc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBwYXRjaEZldGNoLCAgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcCJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fauth%2Flogin%2Froute&page=%2Fapi%2Fauth%2Flogin%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Flogin%2Froute.ts&appDir=D%3A%5CPersonal_Project%5Cyoutube-ui%5Cbackend%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CPersonal_Project%5Cyoutube-ui%5Cbackend&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(ssr)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "../app-render/action-async-storage.external":
/*!*******************************************************************************!*\
  !*** external "next/dist/server/app-render/action-async-storage.external.js" ***!
  \*******************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/action-async-storage.external.js");

/***/ }),

/***/ "../app-render/after-task-async-storage.external":
/*!***********************************************************************************!*\
  !*** external "next/dist/server/app-render/after-task-async-storage.external.js" ***!
  \***********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/after-task-async-storage.external.js");

/***/ }),

/***/ "../app-render/work-async-storage.external":
/*!*****************************************************************************!*\
  !*** external "next/dist/server/app-render/work-async-storage.external.js" ***!
  \*****************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-async-storage.external.js");

/***/ }),

/***/ "./work-unit-async-storage.external":
/*!**********************************************************************************!*\
  !*** external "next/dist/server/app-render/work-unit-async-storage.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-unit-async-storage.external.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "node:crypto":
/*!******************************!*\
  !*** external "node:crypto" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:crypto");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@upstash","vendor-chunks/zod","vendor-chunks/@vercel","vendor-chunks/uncrypto"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fauth%2Flogin%2Froute&page=%2Fapi%2Fauth%2Flogin%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Flogin%2Froute.ts&appDir=D%3A%5CPersonal_Project%5Cyoutube-ui%5Cbackend%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CPersonal_Project%5Cyoutube-ui%5Cbackend&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();