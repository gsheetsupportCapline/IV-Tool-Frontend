import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import "./Table.css";
const Table = ({ data, headers }) => {
  return (
    <div className="table-container">
      <DataTable
        value={data}
        paginator
        rows={5}
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
        tableStyle={{ minWidth: "50rem" }}
        rowClassName={(rowData, rowIndex) =>
          rowIndex % 2 === 0 ? "even-row" : "odd-row"
        }
      >
        {headers.map((header, index) => (
          <Column
            key={index}
            field={header}
            header={header}
            style={{ width: "5%" }}
          />
        ))}
      </DataTable>
    </div>
  );
};

export default Table;
