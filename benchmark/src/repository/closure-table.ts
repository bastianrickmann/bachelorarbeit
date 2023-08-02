import {AppDataSource} from "../data-source";
import {ClosureCategory} from "../entity/closure-table-category";



const ClosureRepository = AppDataSource.getRepository(ClosureCategory)
    .extend({
        save: () => {

        }
    })