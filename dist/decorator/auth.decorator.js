"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Active = exports.Role = void 0;
const common_1 = require("@nestjs/common");
const Role = (role) => (0, common_1.SetMetadata)('role', role);
exports.Role = Role;
const Active = (status) => (0, common_1.SetMetadata)('status', status);
exports.Active = Active;
//# sourceMappingURL=auth.decorator.js.map