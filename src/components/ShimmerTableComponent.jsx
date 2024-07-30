import { ShimmerTable } from "shimmer-effects-react";

const ShimmerTableComponent = () => {
  return (
    <ShimmerTable
      mode="light" // Light theme for the shimmer effect
      row={7} // Number of rows
      col={5} // Number of columns
      border={1} // Border width
      borderColor="#cbd5e1" // Border color
      rounded={0.25} // Corner radius
      rowGap={16} // Gap between rows
      colPadding={[10, 5, 10, 5]} // Padding around columns
    />
  );
};

export default ShimmerTableComponent;
