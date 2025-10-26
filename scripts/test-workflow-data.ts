/**
 * 测试工作流数据结构
 */
async function testWorkflowData() {
  const workflowId = 'cmh73qnwm0001bxqxqohktczl';

  const response = await fetch(`http://localhost:3008/api/workflows/${workflowId}`);
  const workflow = await response.json();

  console.log('='.repeat(80));
  console.log('Workflow ID:', workflow.id);
  console.log('Status:', workflow.status);
  console.log('');
  console.log('Images structure:');
  console.log('  workflow.images:', workflow.images ? 'EXISTS' : 'MISSING');
  console.log('  workflow.images.items:', workflow.images?.items ? `EXISTS (${workflow.images.items.length} items)` : 'MISSING');
  console.log('');

  if (workflow.images?.items) {
    console.log('Image URLs:');
    workflow.images.items.forEach((img: any, idx: number) => {
      console.log(`  [${idx}] ${img.imageUrl}`);
    });
  }
}

testWorkflowData().catch(console.error);
