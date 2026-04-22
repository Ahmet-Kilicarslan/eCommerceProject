import EmployeeRepository from "../domain/employee/EmployeeRepository";
import EmployeeService from "../domain/employee/EmployeeService";
import Employee from "../domain/employee/Employee";
import {} from "../domain/employee/EmployeeFactory";
export default class EmployeeApplication {
    employeeRepository;
    employeeService;
    constructor(employeeRepository, employeeService) {
        this.employeeRepository = employeeRepository;
        this.employeeService = employeeService;
    }
    async addEmployee(employee) {
        try {
            await this.employeeService.addEmployee(employee);
        }
        catch (err) {
            throw err;
        }
    }
    async deleteEmployee(employeeId) {
        try {
            await this.employeeService.deleteEmployee(employeeId);
        }
        catch (err) {
            throw err;
        }
    }
    async getEmployeeById(id) {
        try {
            return await this.employeeService.getEmployeeById(id);
        }
        catch (err) {
            throw err;
        }
    }
    async getAllEmployees() {
        try {
            return await this.employeeService.getAllEmployees();
        }
        catch (err) {
            throw err;
        }
    }
    async updateEmployee(employee) {
        try {
            return await this.employeeService.updateEmployee(employee);
        }
        catch (err) {
            throw err;
        }
    }
}
//# sourceMappingURL=EmployeeApplication.js.map