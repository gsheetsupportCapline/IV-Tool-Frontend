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
        rowsPerPageOptions={[5, 10, 25, 50]}
        tableStyle={{ minWidth: "50rem" }}
      >
        {headers.map((header, index) => (
          <Column
            key={index}
            field={header}
            header={header}
            style={{ width: "10%" }}
          />
        ))}
      </DataTable>
    </div>
  );
};

export default Table;
