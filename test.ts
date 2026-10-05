import { getEventTeams } from './src/app/(admin)/admin/events/[id]/teams/actions';

async function test() {
  const result = await getEventTeams('845112fa-39c4-4b47-ba6e-7164ff89bb73'); // Dummy UUID
  console.log(result);
}
test();
