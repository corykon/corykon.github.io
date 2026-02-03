// Test functions for celebrations - only available in development
if (process.env.NODE_ENV === 'development') {
    // Function to test master celebration
    window.testMasterCelebration = () => {
        // Dispatch custom event to trigger master celebration
        const event = new CustomEvent('testMasterCelebration');
        window.dispatchEvent(event);
        console.log('🏆 Testing Master Celebration!');
    };

    // Function to test progress celebration
    window.testProgressCelebration = (count = 50) => {
        // Dispatch custom event to trigger progress celebration
        const event = new CustomEvent('testProgressCelebration', { detail: { count } });
        window.dispatchEvent(event);
        console.log(`🎯 Testing Progress Celebration for ${count} Pokemon!`);
    };

    // Function to simulate catching multiple Pokemon
    window.simulateCatches = (targetCount) => {
        // This would need to integrate with the actual discovery system
        console.log(`🎮 Simulating catches to reach ${targetCount} Pokemon...`);
        // This function will be enhanced when we integrate with the actual system
    };

    console.log('🎪 Celebration test functions loaded!');
    console.log('📝 Available commands:');
    console.log('  - testMasterCelebration(): Test the 151 Pokemon completion screen');
    console.log('  - testProgressCelebration(count): Test milestone celebration (default: 50)');
    console.log('  - simulateCatches(count): Simulate catching Pokemon to test triggers');
}