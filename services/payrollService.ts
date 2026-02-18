
import { supabase } from './supabaseClient';
import { SalarySlip, TransferOrder, Employee, AttendanceRecord } from '../types';

// ================= SALARY SLIPS =================

export async function saveSalarySlip(slip: SalarySlip) {
    // Convert camelCase to snake_case for DB if needed, or rely on Supabase to handle jsonb if using that
    // Prefer mapping to standard columns for better query capability
    const dbSlip = {
        employee_id: slip.employeeId,
        employee_name: slip.employeeName,
        employee_role: slip.employeeRole,
        month: slip.month,
        year: slip.year,
        base_salary: slip.baseSalary,
        salary_base_proportional: slip.salaryBaseProportional || 0,
        allowances: slip.allowances,
        bonuses: slip.bonuses,
        subsidies: slip.subsidies,
        subsidy_transport: slip.subsidyTransport,
        subsidy_food: slip.subsidyFood,
        subsidy_family: slip.subsidyFamily,
        subsidy_housing: slip.subsidyHousing,
        absences: slip.absences,
        absences_justified: slip.absencesJustified || 0,
        advances: slip.advances,
        penalties: slip.penalties || 0,
        gross_total: slip.grossTotal,
        inss: slip.inss,
        irt: slip.irt,
        net_total: slip.netTotal,

        // Proportional details stored as JSONB or separate columns
        days_worked: slip.daysWorked || 0,
        days_off: slip.daysOff || 0,
        days_vacation: slip.daysVacation || 0,
        overtime_hours: slip.overtimeHours || 0,
        lost_hours: slip.lostHours || 0,
        location: slip.location || '',

        processed_at: new Date().toISOString()
    };

    const { data, error } = await supabase
        .from('salary_slips')
        .upsert(dbSlip, { onConflict: 'employee_id, month, year' })
        .select()
        .single();

    if (error) {
        console.error('Error saving salary slip:', error);
        throw error;
    }
    return data;
}

export async function getSalarySlips(month?: number, year?: number) {
    let query = supabase.from('salary_slips').select('*');

    if (month) query = query.eq('month', month);
    if (year) query = query.eq('year', year);

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching salary slips:', error);
        throw error;
    }

    // Map back to SalarySlip type
    return data.map((d: any) => ({
        employeeId: d.employee_id,
        employeeName: d.employee_name,
        employeeRole: d.employee_role,
        month: d.month,
        year: d.year,
        baseSalary: d.base_salary,
        allowances: d.allowances,
        bonuses: d.bonuses,
        subsidies: d.subsidies,
        subsidyTransport: d.subsidy_transport,
        subsidyFood: d.subsidy_food,
        subsidyFamily: d.subsidy_family,
        subsidyHousing: d.subsidy_housing,
        absences: d.absences,
        advances: d.advances,
        penalties: d.penalties,
        grossTotal: d.gross_total,
        inss: d.inss,
        irt: d.irt,
        netTotal: d.net_total,
        daysWorked: d.days_worked,
        daysOff: d.days_off,
        daysVacation: d.days_vacation,
        overtimeHours: d.overtime_hours,
        lostHours: d.lost_hours,
        location: d.location
    })) as SalarySlip[];
}

export async function deleteSalarySlip(employeeId: string, month: number, year: number) {
    const { error } = await supabase
        .from('salary_slips')
        .delete()
        .match({ employee_id: employeeId, month, year });

    if (error) throw error;
}

// ================= ATTENDANCE =================

export async function saveAttendance(attendance: AttendanceRecord) {
    const { data, error } = await supabase
        .from('attendance_records')
        .upsert({
            id: attendance.id,
            employee_id: attendance.employeeId,
            month: attendance.month,
            year: attendance.year,
            days: attendance.days, // Assuming JSONB column
            updated_at: new Date().toISOString()
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getAttendance(month: number, year: number) {
    const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('month', month)
        .eq('year', year);

    if (error) throw error;

    return data.map((d: any) => ({
        id: d.id,
        employeeId: d.employee_id,
        month: d.month,
        year: d.year,
        days: d.days
    })) as AttendanceRecord[];
}

// ================= TRANSFER ORDERS =================

export async function saveTransferOrder(order: TransferOrder) {
    const dbOrder = {
        id: order.id,
        reference: order.reference,
        date: order.date,
        cash_register_id: order.cashRegisterId,
        cash_register_name: order.cashRegisterName,
        total_value: order.totalValue,
        employee_count: order.employeeCount,
        month: order.month,
        year: order.year,
        details: order.details // JSONB
    };

    const { data, error } = await supabase
        .from('transfer_orders')
        .upsert(dbOrder)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getTransferOrders(month?: number, year?: number) {
    let query = supabase.from('transfer_orders').select('*');
    if (month) query = query.eq('month', month);
    if (year) query = query.eq('year', year);

    query = query.order('date', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    return data.map((d: any) => ({
        id: d.id,
        reference: d.reference,
        date: d.date,
        cashRegisterId: d.cash_register_id,
        cashRegisterName: d.cash_register_name,
        totalValue: d.total_value,
        employeeCount: d.employee_count,
        month: d.month,
        year: d.year,
        details: d.details
    })) as TransferOrder[];
}

// ================= EMPLOYEES =================
export async function getEmployees() {
    const { data, error } = await supabase.from('funcionarios').select('*');
    if (error) throw error;

    return data.map((d: any) => ({
        id: d.id,
        name: d.nome,
        nif: d.nif,
        idCardNumber: d.bi_number,
        birthDate: d.data_nascimento,
        gender: d.genero,
        maritalStatus: d.estado_civil,
        nationality: d.nacionalidade,
        email: d.email,
        phone: d.telefone,
        address: d.endereco,
        employeeNumber: d.employee_number,
        role: d.cargo,
        department: d.departamento,
        admissionDate: d.data_admissao,
        contractType: d.tipo_contrato,
        workLocationId: d.work_location_id,
        professionId: d.profession_id,
        status: d.status,
        baseSalary: Number(d.salario_base || 0),
        bankName: d.nome_banco,
        iban: d.iban,
        paymentMethod: d.metodo_pagamento,
        socialSecurityNumber: d.ssn,
        subsidyFood: Number(d.subs_alimentacao || 0),
        subsidyTransport: Number(d.subs_transporte || 0),
        subsidyFamily: Number(d.subs_familia || 0),
        subsidyHousing: Number(d.subs_habitacao || 0),
        allowances: Number(d.abonos || 0),
        photoUrl: d.foto_url
    })) as Employee[];
}

export async function saveEmployee(emp: Employee) {
    const dbEmp = {
        id: emp.id,
        nome: emp.name,
        nif: emp.nif,
        bi_number: emp.idCardNumber,
        data_nascimento: emp.birthDate,
        genero: emp.gender,
        estado_civil: emp.maritalStatus,
        nacionalidade: emp.nationality,
        email: emp.email,
        telefone: emp.phone,
        endereco: emp.address,
        employee_number: emp.employeeNumber,
        cargo: emp.role,
        departamento: emp.department,
        data_admissao: emp.admissionDate,
        tipo_contrato: emp.contractType,
        work_location_id: emp.workLocationId,
        profession_id: emp.professionId,
        status: emp.status,
        salario_base: Number(emp.baseSalary),
        nome_banco: emp.bankName,
        iban: emp.iban,
        metodo_pagamento: emp.paymentMethod,
        ssn: emp.socialSecurityNumber,
        subs_alimentacao: Number(emp.subsidyFood || 0),
        subs_transporte: Number(emp.subsidyTransport || 0),
        subs_familia: Number(emp.subsidyFamily || 0),
        subs_habitacao: Number(emp.subsidyHousing || 0),
        abonos: Number(emp.allowances || 0),
        foto_url: emp.photoUrl,
        updated_at: new Date().toISOString(),
        empresa_id: '00000000-0000-0000-0000-000000000001'
    };

    const { data, error } = await supabase
        .from('funcionarios')
        .upsert(dbEmp)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteEmployee(id: string) {
    const { error } = await supabase
        .from('funcionarios')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

// ================= PROFESSIONS =================

export async function saveProfession(profession: any) {
    const dbProfession = {
        id: profession.id,
        codigo_inss: profession.code,
        nome_profissao: profession.name,
        profissao_inss: profession.indexedProfessionName || profession.name,
        salario_base: profession.baseSalary,
        ajudas_custo: profession.complement,
        created_at: profession.createdAt || new Date().toISOString(),
        created_by: profession.userName
    };

    const { data, error } = await supabase
        .from('profissoes_internas')
        .upsert(dbProfession)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteProfession(id: string) {
    const { error } = await supabase
        .from('profissoes_internas')
        .delete()
        .eq('id', id);

    if (error) throw error;
}
