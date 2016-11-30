import Manager from '~/src/Manager';
import sinon from 'sinon';
import assert from 'assert';
import EventEmitter from 'events';

describe('Manager', () => {

    let testManager, mockHelper, mockExperiment;

    beforeEach(() => {
        mockHelper = {
            triggerExperiment: sinon.stub().returns(0),
        };
        mockExperiment = {
            on: sinon.spy(),
            setGroup: sinon.spy(),
            getId: sinon.stub().returns('FROG'),
            removeListener: sinon.spy(),
        };
        testManager = Manager;
        testManager.setHelper(mockHelper);
    });

    describe('Initialisation', () => {
        it('should take a helper and store it', () => {
            assert.deepEqual(testManager.helper, mockHelper);
        });
    });

    describe('Experiment', () => {
        beforeEach(() => {
            mockExperiment = new EventEmitter();
            mockExperiment.on = sinon.spy(mockExperiment, 'on');
            mockExperiment.removeListener = sinon.spy(mockExperiment, 'removeListener');
            mockExperiment.setGroup = sinon.spy();
            mockExperiment.getId = sinon.stub().returns('FROG');

            testManager.addExperiment(mockExperiment);
        });

        afterEach(() => {
            testManager.removeExperiment('FROG');
        });

        it('should add an experiment to the registry', () => {
            assert.deepEqual(testManager.register, {FROG: mockExperiment});
        });

        it('should remove an experiment from the registry', () => {
            testManager.removeExperiment('FROG');

            sinon.assert.calledOnce(mockExperiment.removeListener);
            assert.deepEqual(testManager.register, {});

            testManager.addExperiment(mockExperiment);
        });

        it('should listen for experiment emitting enrolled', () => {
            sinon.assert.calledOnce(mockExperiment.on);
            sinon.assert.calledWith(mockExperiment.on, 'ENROLLED');
        });

        it('should call activateExperiment when enrolled emitted', () => {
            let mockActivateExperiment = sinon.spy(testManager, 'activateExperiment');

            mockExperiment.emit('ENROLLED');
            sinon.assert.calledOnce(mockActivateExperiment);
            sinon.assert.calledWith(mockActivateExperiment, 'FROG');
        });
    });

    describe('ActiveExperiment', () => {
        it('sets the group on the experiment', () => {
            testManager.addExperiment(mockExperiment);
            let mockGetExperiment = sinon.spy(testManager, 'getExperiment');
            testManager.activateExperiment('FROG');

            sinon.assert.calledOnce(mockGetExperiment);
            sinon.assert.calledWith(mockGetExperiment, 'FROG');

            sinon.assert.calledOnce(mockHelper.triggerExperiment);
            sinon.assert.calledWith(mockHelper.triggerExperiment, mockExperiment);

            sinon.assert.calledOnce(mockExperiment.setGroup);
            sinon.assert.calledWith(mockExperiment.setGroup, 0);

            testManager.removeExperiment('FROG');
        });
    });

});