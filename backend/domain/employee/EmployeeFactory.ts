import Employee from './Employee.js';
import type {RowDataPacket} from "mysql2";


export type EmployeePosition = 'Certified forklifter' | 'Manager' | 'Warehouseman';


//Blue prints for employee entity***

export interface EmployeeData {
    name: string;
    position: EmployeePosition;
    salary: number;
}

export interface EmployeeDataWithId extends EmployeeData {
    id: number;
}


export interface EmployeeRow extends RowDataPacket {
    id: number;
    name: string;
    position: string;
    salary: number;
}

export default class EmployeeFactory {

    private static validatePosition(position: string): position is EmployeePosition {
        const validPositions: EmployeePosition[] = [
            'Certified forklifter',
            'Manager',
            'Warehouseman',
        ];
        return validPositions.includes(position as EmployeePosition);
    }

    static createEmployee(employee: EmployeeData) {
        return new Employee(
            null,
            employee.name,
            employee.position,
            employee.salary
        )
    }

    static createEmployeeWithId(employee: EmployeeDataWithId): Employee {
        return new Employee(
            employee.id,
            employee.name,
            employee.position,
            employee.salary
        )
    }

    static createEmployeeFromDB(employee: EmployeeRow) {

        // Runtime validation
        if (!this.validatePosition(employee.position)) {
            throw new Error(
                `Invalid employee position: "${employee.position}". ` +
                `Valid positions are: Certified Forklifter, Manager, Warehouseman`
            );
        }

        return new Employee(
            employee.id,
            employee.name,
            employee.position,
            employee.salary
        )
    }
}