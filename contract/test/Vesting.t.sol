// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/Vesting.sol";
import "./MockERC20.sol"; // Mock ERC-20 token

contract VestingTest is Test {
    Vesting public vesting;
    MockERC20 public token;

    address owner = address(0x123);
    address beneficiary = address(0x456);
    uint256 initialSupply = 1_000_000 * 10 ** 18; // 1M tokens

    function setUp() public {
        vm.startPrank(owner); // Simulate calls from `owner`
        token = new MockERC20("TestToken", "TTK", initialSupply);
        vesting = new Vesting(address(token));

        // Fund vesting contract with tokens
        token.transfer(address(vesting), 500_000 * 10 ** 18);
        vm.stopPrank();
    }

    function testAddPlan() public {
        vm.startPrank(owner);
        uint256 start = block.timestamp;
        uint256 duration = 180 days;
        uint256 interval = 30 days;
        uint256 amount = 100_000 * 10 ** 18;
        uint256 launchPercent = 10;
        bool canRevoke = true;

        // Add vesting plan
        vesting.addPlan(
            beneficiary,
            start,
            duration,
            interval,
            launchPercent,
            canRevoke,
            amount
        );

        // Validate plan storage
        bytes32 planId = vesting.computePlanId(beneficiary, 0);
        Vesting.VestingPlan memory plan = vesting.getPlan(planId);

        assertEq(plan.beneficiary, beneficiary);
        assertEq(plan.totalAmount, amount);
        assertEq(plan.launchPercent, launchPercent);
        assertEq(plan.canRevoke, canRevoke);
        assertEq(vesting.getPlanCount(beneficiary), 1);
        vm.stopPrank();
    }

    function testReleaseTokens() public {
        vm.startPrank(owner);
        uint256 start = block.timestamp;
        uint256 duration = 180 days;
        uint256 interval = 30 days;
        uint256 amount = 100_000 * 10 ** 18;
        uint256 launchPercent = 10;
        bool canRevoke = true;

        vesting.addPlan(
            beneficiary,
            start,
            duration,
            interval,
            launchPercent,
            canRevoke,
            amount
        );
        bytes32 planId = vesting.computePlanId(beneficiary, 0);

        // Move time past the launch date
        vm.warp(start);

        // Attempt release
        uint256 releasable = vesting.getReleasableAmount(planId);
        vesting.releaseTokens(planId, releasable);

        assertEq(token.balanceOf(beneficiary), releasable);
        assertEq(vesting.getTotalVested(), amount - releasable);
        vm.stopPrank();
    }

    function testCancelPlan() public {
        vm.startPrank(owner);
        uint256 start = block.timestamp;
        uint256 duration = 180 days;
        uint256 interval = 30 days;
        uint256 amount = 100_000 * 10 ** 18;
        uint256 launchPercent = 10;
        bool canRevoke = true;

        vesting.addPlan(
            beneficiary,
            start,
            duration,
            interval,
            launchPercent,
            canRevoke,
            amount
        );
        bytes32 planId = vesting.computePlanId(beneficiary, 0);

        // Cancel plan
        vesting.cancelPlan(planId);
        Vesting.VestingPlan memory plan = vesting.getPlan(planId);
        assertTrue(plan.revoked);
        vm.stopPrank();
    }

    function testNextReleaseTime() public {
        vm.startPrank(owner);
        uint256 start = block.timestamp + 5 minutes;
        uint256 duration = 180 days;
        uint256 interval = 30 days;
        uint256 amount = 100_000 * 10 ** 18;
        uint256 launchPercent = 10;
        bool canRevoke = true;

        vesting.addPlan(
            beneficiary,
            start,
            duration,
            interval,
            launchPercent,
            canRevoke,
            amount
        );

        // Before launch
        assertEq(vesting.getNextReleaseTime(beneficiary), start);

        // Just after launch
        vm.warp(start + 1000);
        assertEq(vesting.getNextReleaseTime(beneficiary), start + interval);

        // Midway through vesting
        vm.warp(start + (interval * 3) - 1);
        assertEq(
            vesting.getNextReleaseTime(beneficiary),
            start + (interval * 3)
        );

        // End of vesting
        vm.warp(start + duration);
        assertEq(vesting.getNextReleaseTime(beneficiary), 0);

        vm.stopPrank();
    }

    function testReleasableAmount() public {
        vm.startPrank(owner);

        // Updated test case: 2000 tokens, 30% launch, 4 tranches of 5 min each
        uint256 start = block.timestamp + 5 minutes;
        uint256 duration = 20 minutes; // 4 intervals of 5 minutes each
        uint256 interval = 5 minutes;
        uint256 amount = 2000 * 10 ** 18;
        uint256 launchPercent = 30;
        bool canRevoke = true;

        vesting.addPlan(
            beneficiary,
            start,
            duration,
            interval,
            launchPercent,
            canRevoke,
            amount
        );

        bytes32 planId = vesting.computePlanId(beneficiary, 0);

        uint256 launchAmount = (amount * launchPercent) / 100; // 600 tokens
        uint256 remainingAmount = amount - launchAmount; // 1400 tokens
        uint256 trancheAmount = remainingAmount / 4; // 350 tokens per tranche

        // Before vesting starts: only launch amount should be available
        vm.warp(start - 1);
        assertEq(vesting.getReleasableAmount(planId), launchAmount);

        // Just after vesting starts, release the launch amount
        vm.warp(start);
        uint256 releasable1 = vesting.getReleasableAmount(planId);
        assertEq(releasable1, launchAmount);

        vesting.releaseTokens(planId, releasable1);
        assertEq(token.balanceOf(beneficiary), releasable1);
        assertEq(vesting.getReleasableAmount(planId), 0); // No extra tokens claimable yet

        // Move forward to first interval
        vm.warp(start + interval);
        uint256 expectedNewRelease2 = trancheAmount; // Only the newly vested tranche
        uint256 releasable2 = vesting.getReleasableAmount(planId);

        assertEq(releasable2, expectedNewRelease2);
        vesting.releaseTokens(planId, releasable2); // Release newly vested amount
        assertEq(token.balanceOf(beneficiary), launchAmount + trancheAmount);

        // Move forward to the third interval (3rd tranche vested)
        vm.warp(start + (interval * 3));
        uint256 expectedReleasable3 = (trancheAmount * 2); // 600 + (350 * 3) = 1650
        uint256 releasable3 = vesting.getReleasableAmount(planId);

        assertEq(releasable3, expectedReleasable3);
        vesting.releaseTokens(planId, releasable3);
        assertEq(
            token.balanceOf(beneficiary),
            launchAmount + (trancheAmount * 3)
        );

        // End of vesting: all should be vested
        vm.warp(start + duration);
        uint256 finalReleasable = vesting.getReleasableAmount(planId);
        assertEq(finalReleasable, trancheAmount); // Remaining tranche

        vesting.releaseTokens(planId, finalReleasable);
        assertEq(token.balanceOf(beneficiary), amount);
        assertEq(vesting.getReleasableAmount(planId), 0); // Nothing left to release

        vm.stopPrank();
    }

    // function testRevokePlan() public {
    //     vm.startPrank(owner);
    //     uint256 start = block.timestamp;
    //     uint256 launch = 10 days;
    //     uint256 duration = 180 days;
    //     uint256 interval = 30 days;
    //     uint256 amount = 100_000 * 10 ** 18;
    //     uint256 launchPercent = 10;
    //     bool canRevoke = true;

    //     vesting.addPlan(
    //         beneficiary,
    //         start,
    //         launch,
    //         duration,
    //         interval,
    //         launchPercent,
    //         canRevoke,
    //         amount
    //     );
    //     bytes32 planId = vesting.computePlanId(beneficiary, 0);

    //     // Midway revoke
    //     vm.warp(start + launch + (duration / 2));
    //     vesting.cancelPlan(planId);

    //     // Plan should be revoked
    //     Vesting.VestingPlan memory plan = vesting.getPlan(planId);
    //     assertTrue(plan.revoked);

    //     // No more releasable amount
    //     assertEq(vesting.getReleasableAmount(planId), 0);

    //     vm.stopPrank();
    // }
}
