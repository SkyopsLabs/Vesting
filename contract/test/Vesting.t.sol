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
        uint256 cliff = 30 days;
        uint256 launch = 10 days;
        uint256 duration = 180 days;
        uint256 interval = 30 days;
        uint256 amount = 100_000 * 10 ** 18;
        uint256 launchPercent = 10;
        bool canRevoke = true;

        // Add vesting plan
        vesting.addPlan(
            beneficiary,
            start,
            cliff,
            launch,
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
        uint256 cliff = 30 days;
        uint256 launch = 10 days;
        uint256 duration = 180 days;
        uint256 interval = 30 days;
        uint256 amount = 100_000 * 10 ** 18;
        uint256 launchPercent = 10;
        bool canRevoke = true;

        vesting.addPlan(
            beneficiary,
            start,
            cliff,
            launch,
            duration,
            interval,
            launchPercent,
            canRevoke,
            amount
        );
        bytes32 planId = vesting.computePlanId(beneficiary, 0);

        // Move time past the launch date
        vm.warp(start + launch);

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
        uint256 cliff = 30 days;
        uint256 launch = 10 days;
        uint256 duration = 180 days;
        uint256 interval = 30 days;
        uint256 amount = 100_000 * 10 ** 18;
        uint256 launchPercent = 10;
        bool canRevoke = true;

        vesting.addPlan(
            beneficiary,
            start,
            cliff,
            launch,
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
}
