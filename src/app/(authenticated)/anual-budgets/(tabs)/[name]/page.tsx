import { getBudgetSummary } from '@actions/anual-budget/action'
import { getAnualBudgetsByAcademicUnit } from '@repositories/anual-budget'
import { BudgetSummary } from 'modules/anual-budget/budget-summary'
import AnualBudgetTable from 'modules/anual-budget/budget-table'

export default async function Page({
    params,
    searchParams,
}: {
    params: { name: string }
    searchParams: { [key: string]: string }
}) {
    const [totalRecords, anualBudgets] = await getAnualBudgetsByAcademicUnit(
        searchParams,
        params.name
    )
    const budgetSummary = await getBudgetSummary(params.name)
    return (
        <>
            <BudgetSummary {...budgetSummary} />
            <AnualBudgetTable
                anualBudgets={anualBudgets}
                totalRecords={totalRecords}
            />
        </>
    )
}
