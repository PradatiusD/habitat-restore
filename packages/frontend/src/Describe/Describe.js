import TextField from '@mui/material/TextField';
function Describe() {
  return (
    <section>
      <div>
        <TextField label="Product Title" variant="outlined" />
      </div>
      <div>
        <TextField label="Product Description" variant="outlined" multiline rows={3} />
      </div>
    </section>
  );
}

export default Describe;
