import EmployeeRepository from "./EmployeeRepository";
import Employee from "./Employee.js";
import type {EmployeeData} from "./EmployeeFactory";

export default class EmployeeService {

    private employeeRepository: EmployeeRepository;

    constructor(employeeRepository: EmployeeRepository) {
        this.employeeRepository = employeeRepository;
    }

async addEmployee(employee:EmployeeData) {
        try{
            await this.employeeRepository.addEmployee(employee);
        }catch(err){
            throw err;
        }
}
async deleteEmployee(employeeId:number) {
        try{
            await  this.employeeRepository.deleteEmployee(employeeId);
        }catch(err){
            throw err;
        }
}
async getEmployeeById(id:number) {
        try{
            return await this.employeeRepository.getEmployeeById(id);
        }catch(err){
            throw err;
        }
}
async getAllEmployees() {
            try{
                return  await this.employeeRepository.getAllEmployees();
            }catch(err){
                throw err;
            }
}
async updateEmployee(employee:Employee){
        try{
            return  await this.employeeRepository.updateEmployee(employee);
        }catch(err){
            throw err;
        }
}
}