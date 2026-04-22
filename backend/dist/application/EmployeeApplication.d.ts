import EmployeeRepository from "../domain/employee/EmployeeRepository";
import EmployeeService from "../domain/employee/EmployeeService";
import Employee from "../domain/employee/Employee";
import { type EmployeeData } from "../domain/employee/EmployeeFactory";
export default class EmployeeApplication {
    private employeeRepository;
    private employeeService;
    constructor(employeeRepository: EmployeeRepository, employeeService: EmployeeService);
    addEmployee(employee: EmployeeData): Promise<void>;
    deleteEmployee(employeeId: number): Promise<void>;
    getEmployeeById(id: number): Promise<Employee>;
    getAllEmployees(): Promise<Employee[]>;
    updateEmployee(employee: Employee): Promise<import("mysql2").QueryResult>;
}
//# sourceMappingURL=EmployeeApplication.d.ts.map