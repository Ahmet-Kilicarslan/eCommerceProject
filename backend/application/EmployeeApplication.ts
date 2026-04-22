import EmployeeRepository from "../domain/employee/EmployeeRepository";
import EmployeeService from "../domain/employee/EmployeeService"
import Employee from "../domain/employee/Employee.js";
import {type EmployeeData} from "../domain/employee/EmployeeFactory";

export default class EmployeeApplication{

    private employeeRepository: EmployeeRepository;
    private employeeService: EmployeeService;

    constructor(employeeRepository:EmployeeRepository,employeeService: EmployeeService){
        this.employeeRepository = employeeRepository;
        this.employeeService = employeeService;
    }
    async addEmployee(employee:EmployeeData) {
        try{
            await this.employeeService.addEmployee(employee);
        }catch(err){
            throw err;
        }
    }
    async deleteEmployee(employeeId:number) {
        try{
            await  this.employeeService.deleteEmployee(employeeId);
        }catch(err){
            throw err;
        }
    }
    async getEmployeeById(id:number) {
        try{
            return await this.employeeService.getEmployeeById(id);
        }catch(err){
            throw err;
        }
    }
    async getAllEmployees() {
        try{
            return  await this.employeeService.getAllEmployees();
        }catch(err){
            throw err;
        }
    }
    async updateEmployee(employee:Employee){
        try{
            return  await this.employeeService.updateEmployee(employee);
        }catch(err){
            throw err;
        }
    }
}