<FormControl>
  <FormLabel>Name</FormLabel>
  <Input
    name="name"
    value={userState.name}
    onChange={store.$.onChange}
  />
</FormControl>

<FormControl>
  <FormLabel>Age</FormLabel>
  <Input
    name="age"
    type="number"
    value={userState.age.toString()}
    onChange={store.$.onChange}
  />
</FormControl>

<FormControl>
  <FormLabel>Email</FormLabel>
  <Input
    name="email"
    type="email"
    value={userState.email}
    onChange={store.$.onChange}
  />
</FormControl>

<Button variant="outline" onClick={() => store?.$.reset()}>
  Reset to Defaults
</Button>

{error && (
  <Alert status="error">
    <AlertIcon />
    {error}
  </Alert>
)}
